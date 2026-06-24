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

type WatchMode = 'poll' | 'windowed-schedule'

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

function parseWatchMode(value: string | undefined): WatchMode {
  const normalized = value?.toLowerCase()

  if (normalized === 'windowed-schedule' || normalized === 'schedule') {
    return 'windowed-schedule'
  }

  return 'poll'
}

function parseScheduleHours(value: string | undefined, fallback: number[]) {
  if (!value) {
    return fallback
  }

  const parsed = value
    .split(',')
    .map((entry) => Number.parseInt(entry.trim(), 10))
    .filter((hour) => Number.isFinite(hour) && hour >= 0 && hour <= 23)

  const uniqueHours = [...new Set(parsed)]
  return uniqueHours.length ? uniqueHours.sort((a, b) => a - b) : fallback
}

function getNextWindowedRun(now: Date, hours: number[], intervalMinutes: number) {
  const sortedHours = [...hours].sort((a, b) => a - b)

  for (let dayOffset = 0; dayOffset < 2; dayOffset += 1) {
    const baseDate = new Date(now)
    baseDate.setDate(baseDate.getDate() + dayOffset)

    for (const hour of sortedHours) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const candidate = new Date(baseDate)
        candidate.setHours(hour, minute, 0, 0)

        if (candidate.getTime() >= now.getTime()) {
          return candidate
        }
      }
    }
  }

  const fallbackDate = new Date(now)
  fallbackDate.setDate(fallbackDate.getDate() + 1)
  fallbackDate.setHours(sortedHours[0] ?? 17, 0, 0, 0)
  return fallbackDate
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

  const pollSeconds = options.pollSeconds ?? parsePositiveInt(readEnv('GMAIL_WATCH_POLL_SECONDS'), 43200)
  const watchMaxResults = options.watchMaxResults ?? parsePositiveInt(readEnv('GMAIL_WATCH_MAX_RESULTS'), 20)
  const maxRememberedIds = options.maxRememberedIds ?? parsePositiveInt(readEnv('GMAIL_WATCH_MAX_REMEMBERED_IDS'), 200)
  const runOnce = options.runOnce ?? ((readEnv('GMAIL_WATCH_RUN_ONCE') ?? 'false').toLowerCase() === 'true')
  const watchMode = parseWatchMode(readEnv('GMAIL_WATCH_MODE'))
  const watchWindowHours = parseScheduleHours(readEnv('GMAIL_WATCH_WINDOW_HOURS'), [17, 22])
  const watchWindowIntervalMinutes = parsePositiveInt(readEnv('GMAIL_WATCH_WINDOW_INTERVAL_MINUTES'), 15)
  const replayLastN = parsePositiveInt(readEnv('GMAIL_REPLAY_LAST_N'), 0)
  const stateFilePath = options.stateFilePath ?? resolveStateFilePath(readEnv('GMAIL_WATCH_STATE_FILE'))
  const log = options.onLog ?? ((message: string) => console.log(message))
  const errorLog = options.onError ?? ((message: string) => console.error(message))

  if (watchMode === 'windowed-schedule') {
    log(`⏱ Modo horario: ${watchWindowHours.join(', ')}h cada ${watchWindowIntervalMinutes} min (hora del servidor)`)
  } else {
    log(`⏱ Polling Gmail cada ${pollSeconds}s`)
  }
  log(`📁 Estado en: ${stateFilePath}`)

  while (true) {
    if (!runOnce && watchMode === 'windowed-schedule') {
      const now = new Date()
      const nextRunAt = getNextWindowedRun(now, watchWindowHours, watchWindowIntervalMinutes)
      const waitMs = Math.max(0, nextRunAt.getTime() - now.getTime())

      if (waitMs > 0) {
        log(`⏳ Próxima ejecución: ${nextRunAt.toLocaleString()}`)
        await sleep(waitMs)
      }
    }

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

    if (watchMode === 'poll') {
      await sleep(pollSeconds * 1000)
    }
  }
}
