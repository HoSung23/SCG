import dotenv from 'dotenv'
import { runGmailWatchLoop } from '../services/gmailWatch.js'

dotenv.config()

async function main() {
  await runGmailWatchLoop()
}

main().catch((error) => {
  console.error('❌ watch-gmail-sync falló:', error instanceof Error ? error.message : error)
  process.exit(1)
})
