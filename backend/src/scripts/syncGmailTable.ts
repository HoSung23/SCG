import dotenv from 'dotenv'
import { loadGmailSyncConfigFromEnv, runGmailSync } from '../services/gmailSync.js'

dotenv.config()

async function main() {
  const config = loadGmailSyncConfigFromEnv()
  const result = await runGmailSync(config)

  console.log('✓ Gmail conectado correctamente')
  console.log(`✓ Correo procesado: ${result.subject}`)
  console.log(`✓ Tabla utilizada: ${result.selectedTableIndex}`)
  console.log(`✓ Tabla detectada con ${result.parsedColumns} columnas y ${result.insertedRows} filas válidas`)
  console.log(`✓ Datos insertados en ${result.destinationTable}`)
}

main().catch((error) => {
  console.error('❌ sync-gmail-table falló:', error instanceof Error ? error.message : error)
  process.exit(1)
})
