import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { listLatestQueryMessageIds, loadGmailSyncConfigFromEnv, runGmailSync } from './gmailSync.js'

type SyncState = {
  lastProcessedMessageId?: string
  processedMessageIds?: string[]
  updatedAt?: string
}

type WatchOptions = {
  pollSeconds?: number
  watchMaxResults?: number
  maxRememberedIds?: number
  runOnce?: boolean
  stateFilePath?: string
  onLog?: (message: string) => void
  onError?: (message: string) => void
}

function readEnv(name: string) {
  const value = process.env[name]
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function resolveStateFilePath(inputPath?: string) {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const backendRoot = path.resolve(__dirname, '../../')

  if (!inputPath) {
    return path.resolve(backendRoot, '.gmail-sync-state.json')
  }

  return path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(backendRoot, inputPath)
}

async function readState(stateFilePath: string): Promise<SyncState> {
  try {
    const content = await fs.readFile(stateFilePath, 'utf8')
    return JSON.parse(content) as SyncState
  } catch {
    return {}
  }
}

async function writeState(stateFilePath: string, state: SyncState) {
  const directory = path.dirname(stateFilePath)
  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(stateFilePath, JSON.stringify(state, null, 2), 'utf8')
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runGmailWatchLoop(options: WatchOptions = {}) {
  const config = loadGmailSyncConfigFromEnv()

  if (!config.gmailQuery) {
    throw new Error('GMAIL_QUERY es requerido para sync automático')
  }

  const pollSeconds = options.pollSeconds ?? parsePositiveInt(readEnv('GMAIL_WATCH_POLL_SECONDS'), 60)
  const watchMaxResults = options.watchMaxResults ?? parsePositiveInt(readEnv('GMAIL_WATCH_MAX_RESULTS'), 20)
  const maxRememberedIds = options.maxRememberedIds ?? parsePositiveInt(readEnv('GMAIL_WATCH_MAX_REMEMBERED_IDS'), 200)
  const runOnce = options.runOnce ?? ((readEnv('GMAIL_WATCH_RUN_ONCE') ?? 'false').toLowerCase() === 'true')
  const replayLastN = parsePositiveInt(readEnv('GMAIL_REPLAY_LAST_N'), 0)
  const stateFilePath = options.stateFilePath ?? resolveStateFilePath(readEnv('GMAIL_WATCH_STATE_FILE'))
  const log = options.onLog ?? ((message: string) => console.log(message))
  const errorLog = options.onError ?? ((message: string) => console.error(message))

  log(`⏱ Polling Gmail cada ${pollSeconds}s`)
  log(`📁 Estado en: ${stateFilePath}`)

  while (true) {
    try {
      const state = await readState(stateFilePath)
      const latestMessageIds = await listLatestQueryMessageIds(
        config,
        replayLastN > 0 ? replayLastN : watchMaxResults
      )
      const knownIds = new Set(state.processedMessageIds ?? [])

      const pendingIds = replayLastN > 0
        ? [...latestMessageIds].reverse()
        : latestMessageIds
          .filter((id) => !knownIds.has(id))
          .reverse()

      if (!pendingIds.length) {
        log('• Sin correos nuevos para procesar')
      } else {
        const newlyProcessedIds: string[] = []

        for (const messageId of pendingIds) {
          const result = await runGmailSync(config, { messageId })
          newlyProcessedIds.push(result.messageId)
          log(`✓ Sync automático aplicado (${result.insertedRows} filas) desde mensaje ${result.messageId}`)
        }

        const mergedIds = [
          ...newlyProcessedIds,
          ...(state.processedMessageIds ?? [])
        ]

        const uniqueIds = [...new Set(mergedIds)].slice(0, maxRememberedIds)

        await writeState(stateFilePath, {
          lastProcessedMessageId: newlyProcessedIds[newlyProcessedIds.length - 1],
          processedMessageIds: uniqueIds,
          updatedAt: new Date().toISOString()
        })

        if (replayLastN > 0) {
          log(`• Modo ventana activa: últimos ${replayLastN} correos revisados`) 
        }
      }
    } catch (error) {
      errorLog(`❌ watch-gmail-sync error: ${error instanceof Error ? error.message : String(error)}`)
    }

    if (runOnce) {
      break
    }

    await sleep(pollSeconds * 1000)
  }
}
