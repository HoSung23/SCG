import express from 'express'
import cors from 'cors'
import 'express-async-errors'
import dotenv from 'dotenv'
import { testSupabaseConnection } from './utils/supabase.js'
import truckRoutes from './routes/trucks.js'
import pilotRoutes from './routes/pilots.js'
import tripRoutes from './routes/trips.js'
import maintenanceRoutes from './routes/maintenance.js'
import fuelRoutes from './routes/fuel.js'
import costRoutes from './routes/costs.js'
import alertRoutes from './routes/alerts.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/trucks', truckRoutes)
app.use('/api/pilots', pilotRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api/fuel', fuelRoutes)
app.use('/api/costs', costRoutes)
app.use('/api/alerts', alertRoutes)

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
async function start() {
  try {
    // Test Supabase connection
    const isConnected = await testSupabaseConnection()
    if (!isConnected) {
      console.warn('⚠ Supabase not configured. Running in mock mode.')
    }

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`)
      console.log(`✓ API docs: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
