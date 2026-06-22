import { useState } from 'react'

export type SessionUser = {
  username: string
  displayName: string
  role: string
}

const AUTH_STORAGE_KEY = 'scg.session'

export function useSessionState() {
  const [session, setSession] = useState<SessionUser | null>(() => {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) {
        return null
      }

      const parsed = JSON.parse(raw) as SessionUser
      if (!parsed?.username || !parsed?.displayName || !parsed?.role) {
        return null
      }

      return parsed
    } catch {
      return null
    }
  })

  const login = (user: SessionUser) => {
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    } catch (error) {
      console.error('Failed to persist session:', error)
    }
    setSession(user)
  }

  const logout = () => {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
    setSession(null)
  }

  return {
    session,
    login,
    logout,
    isAuthenticated: session !== null
  }
}
