import dotenv from 'dotenv'
import { google } from 'googleapis'
import readline from 'node:readline'

dotenv.config()

async function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

function extractAuthorizationCode(input: string) {
  const trimmed = input.trim()
  if (!trimmed) {
    return ''
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed)
      return parsed.searchParams.get('code') ?? ''
    } catch {
      return ''
    }
  }

  return trimmed
}

function readCliValue(args: string[], key: string) {
  const normalizedKey = key.replace(/^--/, '')

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index]

    if (current === `--${normalizedKey}`) {
      return args[index + 1] ?? ''
    }

    if (current.startsWith(`--${normalizedKey}=`)) {
      return current.slice(normalizedKey.length + 3)
    }

    if (current.startsWith(`${normalizedKey}=`)) {
      return current.slice(normalizedKey.length + 1)
    }
  }

  return ''
}

async function main() {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const redirectUri = process.env.GMAIL_REDIRECT_URI ?? 'http://localhost:3000/oauth2callback'

  if (!clientId || !clientSecret) {
    throw new Error('Faltan GMAIL_CLIENT_ID o GMAIL_CLIENT_SECRET en .env')
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/gmail.readonly']
  })

  const codeFromArg = readCliValue(process.argv.slice(2), 'code')
  const urlFromArg = readCliValue(process.argv.slice(2), 'url')
  const codeFromEnv = process.env.GMAIL_AUTH_CODE
  const hasPresetInput = Boolean(codeFromArg || urlFromArg || codeFromEnv)

  if (!hasPresetInput) {
    console.log('\n1) Abre esta URL en tu navegador y autoriza la app:\n')
    console.log(authUrl)
    console.log('\n2) Cuando Google redirija, pega aquí el parámetro "code" o la URL completa del callback.\n')
    console.log(`Redirect URI configurado: ${redirectUri}\n`)
  }

  const codeInput = codeFromArg || urlFromArg || codeFromEnv || (await ask('Authorization code o URL final: '))
  const code = extractAuthorizationCode(codeInput)
  if (!code) {
    throw new Error('No se pudo extraer el authorization code. Copia el valor de code=... o pega la URL completa.')
  }

  const { tokens } = await oauth2Client.getToken(code)

  if (!tokens.refresh_token) {
    throw new Error('Google no devolvió refresh_token. Revoca acceso y vuelve a intentar con prompt=consent.')
  }

  console.log('\n✅ Copia este valor en GMAIL_REFRESH_TOKEN de backend/.env:\n')
  console.log(tokens.refresh_token)
}

main().catch((error) => {
  console.error('\n❌ Error:', error instanceof Error ? error.message : error)
  process.exit(1)
})
