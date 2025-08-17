import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import useGlobalReducer from '../hooks/useGlobalReducer'
import { getUserById } from '../services/users'

export const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { userId } = useParams()
  const navigate = useNavigate()
  const { store } = useGlobalReducer()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const user = await getUserById(userId)
        setUserData(user)
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('No se pudo cargar la información del usuario')
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [userId])

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-hero bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="relative z-10 flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-550" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-hero bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="relative z-10 flex justify-center items-center min-h-screen p-4">
          <div className="max-w-md w-full rounded-3xl bg-white/10 backdrop-blur-xl ring-1 ring-white/10 p-6 text-white">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 inline-flex bg-gradient-to-br from-brown-250 to-green-250 rounded-3xl border border-brown-250 px-5 py-2 text-white hover:scale-[1.02] transition"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[100svh]">
      <div className="absolute inset-0 bg-hero bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {userData && (
        <div className="relative z-10 flex justify-center items-center min-h-[100svh] p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white/10 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl p-6 md:p-8 text-white space-y-6 md:space-y-8">

            <header className="flex flex-col sm:flex-row items-center gap-4 rounded-3xl md:rounded-full ring-1 ring-white/15 bg-gradient-to-br from-green-550/30 via-green-350/20 to-brown-550/30 p-4 md:p-5">
              <img
                className="h-20 md:h-40 w-20 md:w-40 rounded-full ring-4 ring-white/80 object-cover"
                src={userData.profile_image || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                alt={`Foto de perfil de ${userData.first_name || 'usuario'}`}
              />
              <div className="text-center sm:text-left">
                <h2 className="font-bold text-xl md:text-2xl">
                  {userData.first_name || 'No especificado'}
                </h2>
                <span className="text-sm text-white/80">{userData.email}</span>
                {store.currentUser?.is_admin && (
                  <p className="text-xs text-white/70 mt-1">ID: {userData.id}</p>
                )}
              </div>
            </header>

            <section className="rounded-2xl bg-white/10 ring-1 ring-white/15 p-4">
              <p className="break-words">
                <span className="font-semibold">Teléfono:</span>{' '}
                {userData.phone_number || 'No especificado'}
              </p>
              <p className="break-words mt-2">
                <span className="font-semibold">Dirección:</span>{' '}
                {userData.address || 'No especificado'}
              </p>
              <p className="break-words mt-3 flex items-center gap-2">
                <span className="font-semibold">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs ring-1 ring-white/20 ${userData.is_active ? 'bg-green-500/70' : 'bg-red-500/70'}`}>
                  {userData.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </p>
            </section>

            {store.currentUser?.is_admin && (
              <div className="flex flex-wrap justify-center gap-3 text-xs md:text-sm">
                <Link
                  to={`/bookings/${userData.id}`}
                  className="hover:underline hover:scale-[1.02] hover:text-green-150 px-2 py-1"
                >
                  Ver reservas del huésped
                </Link>
                <button
                  onClick={() => setIsOpen(true)}
                  className="hover:underline hover:scale-[1.02] hover:text-green-150 px-2 py-1"
                >
                  {userData.is_active ? 'Desactivar cuenta' : 'Activar cuenta'}
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={() => navigate(-1)}
                className="bg-gradient-to-br from-brown-250 to-green-250 rounded-3xl border border-brown-250 text-center text-sm md:text-base md:w-1/4 p-2 hover:scale-[1.02] text-white"
              >
                Atrás
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && store.currentUser?.is_admin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-start gap-4 border-b p-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brown-550">
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg md:text-xl font-semibold text-stone-800">
                    {userData.is_active ? 'Desactivar cuenta' : 'Activar cuenta'}
                  </h3>
                  <button onClick={() => setIsOpen(false)} className="text-stone-500 hover:text-stone-700 ml-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 text-sm md:text-base text-stone-700">
                  <p>¿Confirmas que deseas {userData.is_active ? 'desactivar' : 'activar'} esta cuenta?</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>{userData.is_active ? 'El usuario no podrá iniciar sesión' : 'El usuario podrá acceder nuevamente'}</li>
                    <li>Las reservas existentes se mantienen</li>
                    <li>Podrás revertir esta acción cuando quieras</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-stone-600 hover:text-stone-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // aquí va tu lógica real de activar/desactivar
                  setIsOpen(false)
                }}
                className="px-5 py-2 bg-gradient-to-br from-brown-550 to-green-450 rounded-3xl border border-brown-250 hover:scale-[1.02] text-white"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
