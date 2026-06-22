import dotenv from 'dotenv'
import { createGmailClient, fetchMessageHtml, findLatestMessageId } from '../utils/gmail.js'
import { parseHtmlTables } from '../utils/htmlTable.js'

dotenv.config()

function readEnv(name: string) {
  const value = process.env[name]
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

async function main() {
  const clientId = readEnv('GMAIL_CLIENT_ID')
  const clientSecret = readEnv('GMAIL_CLIENT_SECRET')
  const refreshToken = readEnv('GMAIL_REFRESH_TOKEN')
  const gmailUserId = readEnv('GMAIL_USER_ID') ?? 'me'
  const gmailQuery = readEnv('GMAIL_QUERY')
  const gmailMessageId = readEnv('GMAIL_MESSAGE_ID')

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Faltan credenciales de Gmail')
  }

  if (!gmailMessageId && !gmailQuery) {
    throw new Error('Define GMAIL_MESSAGE_ID o GMAIL_QUERY')
  }

  const gmail = createGmailClient({ clientId, clientSecret, refreshToken, userId: gmailUserId })
  const messageId = gmailMessageId || (await findLatestMessageId(gmail, gmailUserId, gmailQuery!))
  const message = await fetchMessageHtml(gmail, gmailUserId, messageId)
  const tables = parseHtmlTables(message.html)

  console.log(`Correo: ${message.subject || message.messageId}`)
  console.log(`Tablas detectadas: ${tables.length}`)

  tables.forEach((table, index) => {
    const firstRow = table.rows[0] ?? {}
    console.log(`\nTabla ${index + 1}`)
    console.log(`Headers: ${table.headers.join(', ')}`)
    console.log(`Fila ejemplo: ${JSON.stringify(firstRow)}`)
    console.log(`Filas: ${table.rows.length}`)
  })
}

main().catch((error) => {
  console.error('❌ inspect-gmail-tables falló:', error instanceof Error ? error.message : error)
  process.exit(1)
})
