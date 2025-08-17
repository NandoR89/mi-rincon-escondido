import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useGlobalReducer from "../hooks/useGlobalReducer"
import { login, requestPasswordReset } from "../services/auth"

const Login = () => {
  const { store, dispatch } = useGlobalReducer()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Recuperación de contraseña
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      })

      const storage = formData.rememberMe ? localStorage : sessionStorage
      storage.setItem('token', result.access_token)
      storage.setItem('currentUser', JSON.stringify(result.results))

      dispatch({ type: 'token', payload: result.access_token })
      dispatch({ type: 'isLogged', payload: true })
      dispatch({ type: 'currentUser', payload: result.results })
      // Mantengo tu lógica original:
      dispatch({ type: 'users', payload: [...(store.users || []), result.results] })

      navigate('/')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
      dispatch({
        type: 'handle_alert',
        payload: { text: 'Error al iniciar sesión', background: 'danger', visible: true }
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await requestPasswordReset({ email: resetEmail.trim().toLowerCase() })
      setResetSuccess(true)
    } catch (err) {
      setError(err.message || 'No se pudo enviar el correo de recuperación')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({ email: '', password: '', rememberMe: false })
    dispatch({
      type: 'handle_alert',
      payload: { text: 'Cancelar', background: 'danger', visible: true }
    })
    navigate('/')
  }

  return (
    <div className="relative min-h-[100svh]">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="https://res.cloudinary.com/dmtvki1tj/video/upload/v1753687889/5081297_Rural_Countryside_1920x1080_tdybmx.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[100svh] px-4 py-10">
        <div className="w-full max-w-xl rounded-3xl overflow-hidden bg-white/10 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">
              <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">
                Iniciar sesión
              </span>
            </h1>
            <div className="w-24 h-[2px] mx-auto mt-4 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            <p className="mt-3 text-white/80 text-sm">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="underline decoration-green-350 decoration-2 underline-offset-4 hover:text-green-150">
                Crea una nueva
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-500/10 ring-1 ring-red-500/30 text-red-200 px-4 py-3">
              {error}
            </div>
          )}

          {resetSuccess ? (
            <div className="text-center">
              <div className="mb-4 rounded-2xl bg-green-500/10 ring-1 ring-green-500/30 text-green-100 px-4 py-3">
                ¡Listo! Si el correo existe, recibirás un enlace para restablecer tu contraseña.
              </div>
              <button
                onClick={() => { setShowResetForm(false); setResetSuccess(false); }}
                className="w-full rounded-2xl border border-brown-250 bg-gradient-to-br from-brown-550 to-green-450 px-6 py-3 text-white font-semibold hover:scale-[1.02] transition"
              >
                Volver al login
              </button>
            </div>
          ) : showResetForm ? (
            <form className="space-y-6" onSubmit={handlePasswordReset}>
              <div>
                <label htmlFor="reset-email" className="text-white/90 text-sm">Correo electrónico</label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-white/20 bg-white/90 text-stone-900 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-green-350"
                  placeholder="tucorreo@email.com"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 rounded-2xl border border-brown-250 bg-gradient-to-br from-brown-550 to-green-450 px-6 py-3 text-white font-semibold hover:scale-[1.02] transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Enviando…' : 'Enviar instrucciones'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetForm(false)}
                  className="flex-1 rounded-2xl border border-brown-250 bg-gradient-to-br from-brown-250 to-green-250 px-6 py-3 text-white font-semibold hover:scale-[1.02] transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            // Modo Login
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="text-white/90 text-sm">Correo electrónico</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-white/20 bg-white/90 text-stone-900 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-green-350"
                  placeholder="tucorreo@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-white/90 text-sm">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-white/20 bg-white/90 text-stone-900 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-green-350"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-white/90 text-sm">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-white/30 bg-white/90 text-green-450 focus:ring-green-350"
                  />
                  Recordarme
                </label>

                <button
                  type="button"
                  onClick={() => { setShowResetForm(true); setError(null); }}
                  className="text-white/80 text-sm underline decoration-green-350 underline-offset-4 hover:text-green-150"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 rounded-2xl border border-brown-250 bg-gradient-to-br from-brown-550 to-green-450 px-6 py-3 text-white font-semibold hover:scale-[1.02] transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 rounded-2xl border border-brown-250 bg-gradient-to-br from-brown-250 to-green-250 px-6 py-3 text-white font-semibold hover:scale-[1.02] transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
