import { supabaseAdmin } from '../utils/supabase.js'
import { verifyPassword } from '../utils/password.js'

type AuthUserRow = {
  id: string
  email: string
  password_hash: string
  name: string
  role: string
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()

  const { data, error } = await supabaseAdmin
    .from('auth_users')
    .select('id, email, password_hash, name, role')
    .eq('email', normalizedEmail)
    .single<AuthUserRow>()

  if (error || !data) {
    return { success: false as const, message: 'Credenciales inválidas' }
  }

  const isValidPassword = await verifyPassword(password, data.password_hash)
  if (!isValidPassword) {
    return { success: false as const, message: 'Credenciales inválidas' }
  }

  return {
    success: true as const,
    user: {
      id: data.id,
      username: data.email.split('@')[0],
      displayName: data.name,
      role: data.role
    }
  }
}

