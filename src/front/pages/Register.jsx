import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useGlobalReducer from "../hooks/useGlobalReducer"
import { register } from "../services/auth"

const Register = () => {
  const { store, dispatch } = useGlobalReducer()
  const [formData, setFormData] = useState({
    first_name: '',
    email: '',
    password: '',
    agreeTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.agreeTerms) {
      setError('Debes aceptar los términos y condiciones')
      setLoading(false)
      return
    }

    try {
      const dataToSend = {
        first_name: formData.first_name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      }

      const result = await register(dataToSend)

      const storage = formData.rememberMe ? localStorage : sessionStorage
      storage.setItem('token', result.access_token)
      storage.setItem('currentUser', JSON.stringify(result.results))
      storage.setItem('users', JSON.stringify(result.results))

      dispatch({ type: 'token', payload: result.access_token })
      dispatch({ type: 'isLogged', payload: true })
      dispatch({ type: 'currentUser', payload: result.results })
      dispatch({ type: 'users', payload: [...(store.users || []), result.results] })

      navigate('/')
    } catch (err) {
      setError(err.message || 'Error al registrar la cuenta')
      dispatch({
        type: 'handle_alert',
        payload: { text: 'Error al registrar', background: 'danger', visible: true }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({ first_name: '', email: '', password: '', agreeTerms: false })
    dispatch({
      type: 'handle_alert',
      payload: { text: 'Formulario cancelado', background: 'warning', visible: true }
    })
  }

  return (
    <div className="relative min-h-[100svh]">
      {/* Vídeo de fondo (igual) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="https://res.cloudinary.com/dmtvki1tj/video/upload/v1753689318/1104240_1080p_Laugh_1280x720_hizoyi.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Tarjeta glass centrada (sin aside) */}
      <div className="relative z-10 flex items-center justify-center min-h-[100svh] px-4 py-10">
        <div className="w-full max-w-xl rounded-3xl overflow-hidden bg-white/10 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">
              <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">
                Crear una cuenta
              </span>
            </h1>
            <div className="w-24 h-[2px] mx-auto mt-4 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            <p className="mt-3 text-white/80 text-sm">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="underline decoration-green-350 decoration-2 underline-offset-4 hover:text-green-150">
                Inicia sesión
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-500/10 ring-1 ring-red-500/30 text-red-200 px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="first_name" className="text-white/90 text-sm">Nombre</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-white/20 bg-white/90 text-stone-900 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-green-350"
                placeholder="Tu nombre"
              />
            </div>

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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-white/20 bg-white/90 text-stone-900 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-green-350"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                required
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="h-4 w-4 rounded border-white/30 bg-white/90 text-green-450 focus:ring-green-350"
              />
              <label htmlFor="agreeTerms" className="text-white/90 text-sm">
                Acepto los{' '}
                <Link to="/termsandconditions" className="underline decoration-green-350 decoration-2 underline-offset-4 hover:text-green-150">
                  términos y condiciones
                </Link>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 rounded-2xl border border-brown-250 bg-gradient-to-br from-brown-550 to-green-450 px-6 py-3 text-white font-semibold hover:scale-[1.02] transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>

              <Link
                to="/login"
                onClick={handleReset}
                className="flex-1 text-center rounded-2xl border border-brown-250 bg-gradient-to-br from-brown-250 to-green-250 px-6 py-3 text-white font-semibold hover:scale-[1.02] transition"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
