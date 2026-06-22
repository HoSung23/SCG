import { supabaseAdmin } from './utils/supabase.js'
import { hashPassword } from './utils/password.js'

type DemoUser = {
  email: string
  name: string
  role: string
  password: string
}

const DEMO_USERS: DemoUser[] = [
  { email: 'superadmin@scg.gt', name: 'Admin SCG', role: 'Superadmin', password: 'SCG2026!' },
  { email: 'admin@scg.gt', name: 'Operaciones SCG', role: 'Admin', password: 'SCG2026!' },
  { email: 'gerente@scg.gt', name: 'Gerencia SCG', role: 'Gerente', password: 'SCG2026!' },
  { email: 'contador@scg.gt', name: 'Contabilidad SCG', role: 'Contador', password: 'SCG2026!' }
]

async function ensureTableExists() {
  const { error } = await supabaseAdmin.from('auth_users').select('id').limit(1)
  if (error) {
    throw new Error(
      'La tabla auth_users no existe o no es accesible. Ejecuta primero la migración SQL en supabase/migrations/20260615_create_auth_users.sql'
    )
  }
}

async function upsertUser(user: DemoUser) {
  const passwordHash = await hashPassword(user.password)

  const { error } = await supabaseAdmin.from('auth_users').upsert(
    {
      email: user.email,
      name: user.name,
      role: user.role,
      password_hash: passwordHash
    },
    { onConflict: 'email' }
  )

  if (error) {
    throw new Error(`[${user.email}] ${error.message}`)
  }
}

async function main() {
  console.log('🔐 Verificando tabla auth_users...')
  await ensureTableExists()

  console.log('👤 Creando/actualizando usuarios demo...')
  for (const user of DEMO_USERS) {
    await upsertUser(user)
    console.log(`✓ ${user.email} (${user.role})`)
  }

  console.log('✅ Usuarios demo listos')
}

main().catch((error) => {
  console.error('❌ setup-auth falló:', error instanceof Error ? error.message : error)
  process.exit(1)
})
