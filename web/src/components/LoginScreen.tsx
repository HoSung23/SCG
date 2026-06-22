import { FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { API_BASE_URL } from '../services/api'

export type SessionUser = {
  username: string
  displayName: string
  role: string
}

export type LoginScreenProps = {
  onLoginSuccess: (user: SessionUser) => void
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password) {
      setError('Ingresa email y contraseña')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      })

      const data = await response.json()

      if (!response.ok || !data?.user) {
        setError(data?.error ?? 'Credenciales inválidas')
        return
      }

      const nextSession: SessionUser = {
        username: data.user.username ?? email.split('@')[0],
        displayName: data.user.displayName,
        role: data.user.role
      }

      toast.success('Sesión iniciada', { description: `Bienvenido, ${nextSession.displayName}` })
      onLoginSuccess(nextSession)
    } catch {
      setError('No se pudo conectar con el backend')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page !relative !isolate !min-h-screen !overflow-hidden !flex !items-center !justify-center !p-6">
      <div className="pointer-events-none !absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.08),transparent_40%)]" />

      <section className="login-page__card !relative !z-10 !w-full !max-w-md !overflow-hidden !rounded-3xl !border !border-slate-700/60 !bg-slate-900/88 !backdrop-blur-xl !shadow-[0_20px_60px_rgba(2,6,23,0.45)]">
        <div className="!absolute !top-0 !left-0 !h-1 !w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500" />

        <div className="!p-8">
          <div className="!mb-8 !text-center">
            <div className="login-page__badge !mx-auto !mb-5 !flex !h-16 !w-16 !items-center !justify-center !rounded-2xl !bg-gradient-to-br from-cyan-500 to-blue-600 !text-white !text-xl !font-bold !shadow-lg">
              SCG
            </div>

            <h1 className="login-page__title !text-3xl !font-bold !text-slate-50">
              Bienvenido
            </h1>

            <p className="login-page__subtitle !mt-2 !text-sm !text-slate-300">
              Accede al sistema de control de transporte
            </p>
          </div>

          <form onSubmit={handleSubmit} className="!space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="login-page__label !mb-2 !block !text-sm !font-medium !text-slate-200"
              >
                Correo electrónico
              </label>

              <div className="!relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="usuario@scg.gt"
                  autoComplete="email"
                  className="login-page__input !w-full !rounded-2xl !border !border-slate-700 !bg-slate-950 !px-4 !py-3 !text-slate-50 !outline-none !transition-all focus:!border-cyan-500 focus:!bg-slate-900 focus:!ring-4 focus:!ring-cyan-500/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="login-page__label !mb-2 !block !text-sm !font-medium !text-slate-200"
              >
                Contraseña
              </label>

              <div className="!relative">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="login-page__input !w-full !rounded-2xl !border !border-slate-700 !bg-slate-950 !px-4 !py-3 !text-slate-50 !outline-none !transition-all focus:!border-cyan-500 focus:!bg-slate-900 focus:!ring-4 focus:!ring-cyan-500/10"
                />
              </div>
            </div>

            {error && (
              <div className="login-page__error !rounded-2xl !border !border-red-400/30 !bg-red-500/10 !px-4 !py-3 !text-sm !text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="login-page__button !w-full !rounded-2xl !bg-gradient-to-r !from-cyan-500 !to-blue-600 !py-3 !font-semibold !text-white !shadow-lg !shadow-cyan-500/25 !transition-all hover:!scale-[1.02] hover:!shadow-xl disabled:!opacity-70"
            >
              {isLoading ? 'Validando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="login-page__footer !mt-8 !border-t !border-slate-800 !pt-5 !text-center">
            <p className="!text-xs !text-slate-300">
              Sistema de Control de Gestión
            </p>
            <p className="!mt-1 !text-xs !text-slate-400">
              Autenticación segura mediante Supabase
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}