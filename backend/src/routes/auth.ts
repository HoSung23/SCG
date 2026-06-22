import express from 'express'
import { loginUser } from '../controllers/auth.js'

const router = express.Router()

router.post('/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' })
  }

  try {
    const result = await loginUser(email, password)
    if (!result.success) {
      return res.status(401).json({ error: result.message })
    }

    return res.json({ success: true, user: result.user })
  } catch (error) {
    console.error('Auth login error:', error)
    return res.status(500).json({ error: 'Error interno en autenticación' })
  }
})

export default router
