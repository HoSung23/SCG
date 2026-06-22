import dotenv from 'dotenv'
import { createGmailClient } from '../utils/gmail.js'

dotenv.config()

async function main() {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN
  const gmailUserId = process.env.GMAIL_USER_ID ?? 'me'

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Faltan credenciales de Gmail. Define GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET y GMAIL_REFRESH_TOKEN.')
  }

  const gmail = createGmailClient({
    clientId,
    clientSecret,
    refreshToken,
    userId: gmailUserId
  })

  const profile = await gmail.users.getProfile({ userId: gmailUserId })

  console.log('✓ Conexión Gmail API activa')
  console.log(`✓ Cuenta: ${profile.data.emailAddress ?? '(sin email)'}`)
  console.log(`✓ Total mensajes: ${profile.data.messagesTotal ?? 0}`)
}

main().catch((error) => {
  console.error('❌ Gmail API no disponible:', error instanceof Error ? error.message : error)
  process.exit(1)
})
