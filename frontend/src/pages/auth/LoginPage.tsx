import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, BookOpen, Loader2, Lock, Mail } from 'lucide-react'
import { authApi } from '@/api/auth.api'
import { setAccessToken } from '@/api/client'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setErrorMensaje(null)

    try {
      // 1. Iniciar sesión y obtener token JWT
      const tokenData = await authApi.login({ email, password })
      
      // 2. Establecer token temporal en memoria para consultar perfil
      setAccessToken(tokenData.access_token)
      
      // 3. Obtener perfil del usuario autenticado
      const perfilUsuario = await authApi.getMe()

      // 4. Actualizar estado global en AuthContext
      login(tokenData.access_token, perfilUsuario)

      // 5. Redireccionar según el rol oficial
      switch (perfilUsuario.rol) {
        case 'Operador Taller':
          navigate('/ordenes', { replace: true })
          break
        case 'Operador Mostrador':
          navigate('/proformas', { replace: true })
          break
        case 'Cliente':
          navigate('/proformas', { replace: true })
          break
        default:
          navigate('/dashboard', { replace: true })
          break
      }
    } catch (err: unknown) {
      // Limpiar token en caso de fallo
      setAccessToken(null)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        setErrorMensaje(
          axiosErr.response?.data?.detail || 'Credenciales incorrectas o usuario inactivo.'
        )
      } else {
        setErrorMensaje('Error de conexión con el servidor. Verifica que el backend esté activo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#f7f8fb] font-sans text-[#2a3964]">
      {/* Elementos visuales de fondo */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#d9eef3] opacity-80" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-[#edf0f7] opacity-80" />

      {/* Panel Izquierdo: Identidad Institucional UAGRM */}
      <section className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[#800000] px-12 py-10 text-white lg:flex xl:px-20">
        <div className="absolute bottom-0 right-0 h-full w-full opacity-25">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polygon fill="#670000" points="0,100 100,0 100,100" />
          </svg>
        </div>
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full border-[32px] border-white/15" />

        <div className="relative z-10">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-xl border border-white/30 bg-white p-3 text-[#2a3964] shadow-xl">
              <BookOpen size={32} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-[0.14em]">EIU UAGRM</h1>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.25em] text-[#d9eef3]">
                Imprenta Universitaria
              </p>
            </div>
          </div>
          <div className="mb-5 h-1 w-16 rounded-full bg-[#55a6bc]" />
          <h2 className="mb-5 max-w-xl text-4xl font-extrabold leading-[1.12] text-white xl:text-5xl">
            Gestión inteligente para la imprenta universitaria
          </h2>
          <p className="max-w-lg text-base leading-7 text-[#f1dfe0] xl:text-lg">
            Presupuesta, controla la producción litográfica y planifica tus insumos con Machine Learning desde un solo lugar.
          </p>
        </div>

        <div className="relative z-10 border-l-2 border-[#55a6bc] pl-4 text-sm leading-6 text-white/80">
          <p>&copy; 2026 Universidad Autónoma Gabriel René Moreno.</p>
          <p>Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones.</p>
        </div>
      </section>

      {/* Panel Derecho: Formulario de Autenticación */}
      <section className="relative z-10 flex w-full items-center justify-center px-6 py-10 sm:px-10 lg:w-[54%] lg:px-16 xl:px-24">
        <div className="w-full max-w-[29rem] rounded-2xl border border-[#d9dce6] bg-white p-7 shadow-[0_24px_70px_rgba(42,57,100,0.14)] sm:p-10">
          <header className="mb-8 text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#f7e9e9] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#800000]">
              <span className="h-2 w-2 rounded-full bg-[#800000]" />
              Acceso seguro
            </div>
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-[#2a3964]">Bienvenido</h2>
            <p className="text-sm leading-6 text-[#64748b]">
              Ingresa tus credenciales para acceder al sistema operativo.
            </p>
          </header>

          {/* Mensaje de Error */}
          {errorMensaje && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#e2b8b8] bg-[#fff6f6] p-4 shadow-sm" role="alert">
              <AlertCircle className="mt-0.5 shrink-0 text-[#800000]" size={20} aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-[#670000]">Error de autenticación</h3>
                <p className="mt-1 text-sm leading-5 text-[#8c3d3d]">{errorMensaje}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold text-[#334155]">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-5 w-5 text-[#55a6bc]" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@uagrm.edu.bo"
                  className="w-full pl-11 pr-4 py-3 border border-[#cbd5e1] rounded-xl bg-[#fbfcfe] text-[#263454] focus:outline-none focus:border-[#800000] focus:ring-4 focus:ring-red-900/10 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold text-[#334155]">
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-5 w-5 text-[#55a6bc]" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-[#cbd5e1] rounded-xl bg-[#fbfcfe] text-[#263454] focus:outline-none focus:border-[#800000] focus:ring-4 focus:ring-red-900/10 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              aria-label="Iniciar sesión"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#800000] px-5 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-[#670000] focus:outline-none focus:ring-4 focus:ring-red-900/20 disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>
          </form>

          {/* Cuentas de Prueba Rápidas */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500">
            <p className="font-bold text-slate-700 mb-2">Cuentas de prueba preconfiguradas:</p>
            <div className="space-y-1 font-mono text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <p><span className="text-slate-400">Admin:</span> admin@uagrm.edu.bo</p>
              <p><span className="text-slate-400">Taller:</span> taller@uagrm.edu.bo</p>
              <p><span className="text-slate-400">Mostrador:</span> mostrador@uagrm.edu.bo</p>
              <p><span className="text-slate-400">Clave común:</span> Uagrm2026*</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}