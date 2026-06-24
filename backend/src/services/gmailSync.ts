import { supabaseAdmin } from '../utils/supabase.js'
import { createGmailClient, fetchMessageHtml, findLatestMessageId, listLatestMessageIds } from '../utils/gmail.js'
import { parseHtmlTableAtIndex, parseHtmlTables, type ParsedTable } from '../utils/htmlTable.js'
import { autoAssignPendingProgramaciones } from './autoAssignProgramacion.js'

export type ColumnMap = Record<string, string>

export type GmailSyncConfig = {
  clientId: string
  clientSecret: string
  refreshToken: string
  gmailUserId: string
  gmailQuery?: string
  gmailMessageId?: string
  destinationTable: string
  tableIndexOneBased?: number
  integerColumns: Set<string>
  columnMap: ColumnMap
  useUpsert: boolean
  upsertColumns: string[]
}

export type GmailSyncResult = {
  messageId: string
  subject: string
  selectedTableIndex: number
  parsedColumns: number
  insertedRows: number
  destinationTable: string
}

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function readEnv(name: string) {
  const value = process.env[name]
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function parseJsonEnv<T>(value: string | undefined, fallback: T): T {
  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    throw new Error(`No se pudo interpretar el JSON de la variable de entorno: ${value}`)
  }
}

function parsePositiveInt(value: string | undefined) {
  if (!value) {
    return undefined
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function parseListEnv(value: string | undefined, fallback: string[]) {
  if (!value) {
    return fallback
  }

  const parsed = value
    .split(',')
    .map((item) => normalizeKey(item))
    .filter(Boolean)

  return parsed.length ? parsed : fallback
}

function hasHtmlLikeContent(value: unknown) {
  return typeof value === 'string' && /<[^>]+>/.test(value)
}

function sanitizeMappedRow(
  row: Record<string, string | number | boolean | null>,
  integerColumns: Set<string>
) {
  const output: Record<string, string | number | boolean | null> = {}

  for (const [key, value] of Object.entries(row)) {
    if (hasHtmlLikeContent(value)) {
      return null
    }

    if (value === null) {
      output[key] = null
      continue
    }

    if (!integerColumns.has(key)) {
      output[key] = value
      continue
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      output[key] = Math.trunc(value)
      continue
    }

    if (typeof value === 'string') {
      const normalized = value.replace(/,/g, '').trim()
      if (!/^-?\d+$/.test(normalized)) {
        return null
      }

      output[key] = Number.parseInt(normalized, 10)
      continue
    }

    return null
  }

  return output
}

function buildRowMapper(columnMap: ColumnMap) {
  const normalizedMap: ColumnMap = Object.fromEntries(
    Object.entries(columnMap).map(([source, target]) => [normalizeKey(source), target])
  )
  const useStrictMapping = Object.keys(normalizedMap).length > 0

  return (row: Record<string, string | number | boolean | null>) => {
    const mappedRow: Record<string, string | number | boolean | null> = {}

    for (const [key, value] of Object.entries(row)) {
      const normalizedSourceKey = normalizeKey(key)

      if (useStrictMapping && !normalizedMap[normalizedSourceKey]) {
        continue
      }

      const targetKey = normalizedMap[normalizedSourceKey] ?? key
      mappedRow[targetKey] = value
    }

    return mappedRow
  }
}

function selectTable(html: string, tableIndexOneBased?: number) {
  let parsedTable: ParsedTable
  let selectedTableIndex = 0

  if (tableIndexOneBased) {
    selectedTableIndex = tableIndexOneBased - 1
    parsedTable = parseHtmlTableAtIndex(html, selectedTableIndex)
  } else {
    const tables = parseHtmlTables(html)
    selectedTableIndex = tables.length > 1 ? 1 : 0
    parsedTable = tables[selectedTableIndex]
  }

  return { parsedTable, selectedTableIndex }
}

export function loadGmailSyncConfigFromEnv(): GmailSyncConfig {
  const clientId = readEnv('GMAIL_CLIENT_ID')
  const clientSecret = readEnv('GMAIL_CLIENT_SECRET')
  const refreshToken = readEnv('GMAIL_REFRESH_TOKEN')
  const gmailUserId = readEnv('GMAIL_USER_ID') ?? 'me'
  const gmailQuery = readEnv('GMAIL_QUERY')
  const gmailMessageId = readEnv('GMAIL_MESSAGE_ID')
  const destinationTable = readEnv('SUPABASE_DESTINATION_TABLE')
  const tableIndexOneBased = parsePositiveInt(readEnv('GMAIL_TABLE_INDEX'))
  const integerColumns = new Set(parseListEnv(readEnv('SUPABASE_INTEGER_COLUMNS'), ['orden']))
  const columnMap = parseJsonEnv<ColumnMap>(process.env.GMAIL_COLUMN_MAP, {})
  const useUpsert = (process.env.SUPABASE_UPSERT ?? 'false').toLowerCase() === 'true'
  const upsertColumns = (process.env.SUPABASE_UPSERT_COLUMNS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Faltan credenciales de Gmail. Define GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET y GMAIL_REFRESH_TOKEN.')
  }

  if (!destinationTable) {
    throw new Error('Define SUPABASE_DESTINATION_TABLE con la tabla destino en Supabase.')
  }

  if (!gmailMessageId && !gmailQuery) {
    throw new Error('Define GMAIL_MESSAGE_ID o GMAIL_QUERY para encontrar el correo que contiene la tabla.')
  }

  return {
    clientId,
    clientSecret,
    refreshToken,
    gmailUserId,
    gmailQuery,
    gmailMessageId,
    destinationTable,
    tableIndexOneBased,
    integerColumns,
    columnMap,
    useUpsert,
    upsertColumns
  }
}

export async function findLatestQueryMessageId(config: GmailSyncConfig) {
  if (!config.gmailQuery) {
    throw new Error('GMAIL_QUERY es requerido para modo automático por polling')
  }

  const gmail = createGmailClient({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    refreshToken: config.refreshToken,
    userId: config.gmailUserId
  })

  return findLatestMessageId(gmail, config.gmailUserId, config.gmailQuery)
}

export async function listLatestQueryMessageIds(config: GmailSyncConfig, maxResults = 20) {
  if (!config.gmailQuery) {
    throw new Error('GMAIL_QUERY es requerido para modo automático por polling')
  }

  const gmail = createGmailClient({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    refreshToken: config.refreshToken,
    userId: config.gmailUserId
  })

  return listLatestMessageIds(gmail, config.gmailUserId, config.gmailQuery, maxResults)
}

export async function runGmailSync(
  baseConfig: GmailSyncConfig,
  options?: { messageId?: string }
): Promise<GmailSyncResult> {
  const messageIdFromOptions = options?.messageId?.trim()
  const messageIdFromConfig = baseConfig.gmailMessageId?.trim()

  const gmail = createGmailClient({
    clientId: baseConfig.clientId,
    clientSecret: baseConfig.clientSecret,
    refreshToken: baseConfig.refreshToken,
    userId: baseConfig.gmailUserId
  })

  const messageId = messageIdFromOptions
    || messageIdFromConfig
    || (await findLatestMessageId(gmail, baseConfig.gmailUserId, baseConfig.gmailQuery!))

  const message = await fetchMessageHtml(gmail, baseConfig.gmailUserId, messageId)
  const { parsedTable, selectedTableIndex } = selectTable(message.html, baseConfig.tableIndexOneBased)

  const mapRow = buildRowMapper(baseConfig.columnMap)
  const rows = parsedTable.rows.map(mapRow)
  const sanitizedRows = rows
    .map((row) => sanitizeMappedRow(row, baseConfig.integerColumns))
    .filter((row): row is Record<string, string | number | boolean | null> => Boolean(row))
  const filteredRows = sanitizedRows.filter((row) => Object.keys(row).length > 0)

  if (!filteredRows.length) {
    throw new Error('No se obtuvieron filas para insertar en Supabase')
  }

  if (baseConfig.useUpsert && !baseConfig.upsertColumns.length) {
    throw new Error('Para usar SUPABASE_UPSERT=true también define SUPABASE_UPSERT_COLUMNS')
  }

  const query = supabaseAdmin.from(baseConfig.destinationTable)

  const result = baseConfig.useUpsert
    ? await query.upsert(filteredRows, { onConflict: baseConfig.upsertColumns.join(',') })
    : await query.insert(filteredRows)

  if (result.error) {
    // Registrar error en gmail_processing_logs
    await supabaseAdmin.from('gmail_processing_logs').insert([{
      gmail_message_id: messageId,
      subject: message.subject || null,
      received_at: message.receivedAt || null,
      rows_inserted: 0,
      status: 'error',
      error_message: result.error.message,
      raw_snippet: null
    }]).then(() => undefined)

    throw new Error(`Error al escribir en Supabase: ${result.error.message}`)
  }

  // Registrar éxito en gmail_processing_logs
  await supabaseAdmin.from('gmail_processing_logs').insert([{
    gmail_message_id: messageId,
    subject: message.subject || null,
    received_at: message.receivedAt || null,
    rows_inserted: filteredRows.length,
    status: 'success',
    error_message: null,
    raw_snippet: null
  }]).then(() => undefined)

  // ✨ Auto-asignar programaciones si la tabla destino es 'programacion'
  if (baseConfig.destinationTable === 'programacion') {
    try {
      const assignResults = await autoAssignPendingProgramaciones()
      const assignedCount = assignResults.filter((r) => r.success).length
      if (assignedCount > 0) {
        console.log(`[gmail-sync] Auto-asignadas ${assignedCount}/${assignResults.length} programaciones`)
      }
    } catch (error) {
      console.error('[gmail-sync] Error en auto-asignación:', error instanceof Error ? error.message : error)
    }
  }

  return {
    messageId,
    subject: message.subject || message.messageId,
    selectedTableIndex: selectedTableIndex + 1,
    parsedColumns: parsedTable.headers.length,
    insertedRows: filteredRows.length,
    destinationTable: baseConfig.destinationTable
  }
}
