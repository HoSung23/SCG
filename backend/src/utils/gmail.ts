import { google, gmail_v1 } from 'googleapis'

type GmailClientOptions = {
  clientId: string
  clientSecret: string
  refreshToken: string
  userId?: string
}

export type GmailMessageTable = {
  messageId: string
  subject: string
  sender: string
  receivedAt?: string
  html: string
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return Buffer.from(padded, 'base64').toString('utf8')
}

function findPartByMimeType(
  part: gmail_v1.Schema$MessagePart | undefined,
  mimeType: string
): gmail_v1.Schema$MessagePart | null {
  if (!part) {
    return null
  }

  if (part.mimeType === mimeType && part.body?.data) {
    return part
  }

  for (const child of part.parts ?? []) {
    const found = findPartByMimeType(child, mimeType)
    if (found) {
      return found
    }
  }

  return null
}

function getHeaderValue(message: gmail_v1.Schema$Message, name: string) {
  const headers = message.payload?.headers ?? []
  const header = headers.find((item) => item.name?.toLowerCase() === name.toLowerCase())
  return header?.value ?? ''
}

export function createGmailClient(options: GmailClientOptions) {
  const oauth2Client = new google.auth.OAuth2(options.clientId, options.clientSecret)
  oauth2Client.setCredentials({ refresh_token: options.refreshToken })

  return google.gmail({ version: 'v1', auth: oauth2Client })
}

export async function findLatestMessageId(gmail: gmail_v1.Gmail, userId: string, query: string) {
  const listResponse = await gmail.users.messages.list({
    userId,
    q: query,
    maxResults: 10,
    includeSpamTrash: false
  })

  const messageId = listResponse.data.messages?.[0]?.id
  if (!messageId) {
    throw new Error(`No se encontró ningún correo para la consulta: ${query}`)
  }

  return messageId
}

export async function listLatestMessageIds(
  gmail: gmail_v1.Gmail,
  userId: string,
  query: string,
  maxResults = 20
) {
  const listResponse = await gmail.users.messages.list({
    userId,
    q: query,
    maxResults,
    includeSpamTrash: false
  })

  return (listResponse.data.messages ?? [])
    .map((message) => message.id)
    .filter((id): id is string => Boolean(id))
}

export async function fetchMessageHtml(gmail: gmail_v1.Gmail, userId: string, messageId: string): Promise<GmailMessageTable> {
  const messageResponse = await gmail.users.messages.get({
    userId,
    id: messageId,
    format: 'full'
  })

  const message = messageResponse.data
  const htmlPart = findPartByMimeType(message.payload, 'text/html')
  const textPart = findPartByMimeType(message.payload, 'text/plain')

  const html = htmlPart?.body?.data
    ? decodeBase64Url(htmlPart.body.data)
    : textPart?.body?.data
      ? `<pre>${decodeBase64Url(textPart.body.data)}</pre>`
      : ''

  if (!html) {
    throw new Error(`El correo ${messageId} no contiene contenido HTML ni texto legible`)
  }

  return {
    messageId,
    subject: getHeaderValue(message, 'Subject'),
    sender: getHeaderValue(message, 'From'),
    receivedAt: getHeaderValue(message, 'Date') || undefined,
    html
  }
}