import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer"
import { getUserById, deactivateUser } from "../services/users"

export const Profile = () => {
  const { store, dispatch } = useGlobalReducer()
  const [isOpen, setIsOpen] = useState(false)
  const [profileUser, setProfileUser] = useState(store.currentUser)
  const [loadingGuest, setLoadingGuest] = useState(false)
  const [processingDeactivate, setProcessingDeactivate] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const host = import.meta.env.VITE_BACKEND_URL

  const foundUser = store.users?.find(u => String(u.id) === String(id))

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) {
      dispatch({ type: "currentUser", payload: null })
      navigate("/login")
      return
    }

    if (!id) {
      setProfileUser(store.currentUser)
      return
    }

    if (String(id) === String(store.currentUser?.id)) {
      setProfileUser(store.currentUser)
      return
    }

    if (foundUser) {
      setProfileUser(foundUser)
      return
    }

    const fetchGuest = async () => {
      try {
        setLoadingGuest(true)
        const fetchedUser = await getUserById({ id, host, token: store.token })
        setProfileUser(fetchedUser)
      } catch (error) {
        console.error(error)
        alert(error.message || 'Error cargando el huésped')
        navigate(-1)
      } finally {
        setLoadingGuest(false)
      }
    }

    fetchGuest()
  }, [id, foundUser, store.currentUser, store.token, host, dispatch, navigate])

  const handleBackProfile = () => {
    navigate('/')
  }

  const handleDeactivate = async () => {
    try {
      setProcessingDeactivate(true)
      const targetId = store.currentUser?.id
      if (!targetId) throw new Error('No hay usuario autenticado')
      await deactivateUser({ id: targetId, host, token: store.token })
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      dispatch({ type: 'logout' })
      setIsOpen(false)
      navigate('/login')
    } catch (e) {
      console.error(e)
      alert(e.message || 'No se pudo completar la operación')
    } finally {
      setProcessingDeactivate(false)
    }
  }

  return (
    <div className="bg-hero text-white bg-black/50">
      {profileUser && !loadingGuest && (
        <div className="flex justify-center items-center min-h-[100svh] p-4 md:p-8">
          <div className="w-full max-w-3xl rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 shadow-2xl space-y-6 md:space-y-8 p-6 md:p-8">

            <header className="flex flex-col sm:flex-row items-center gap-5 rounded-3xl ring-1 ring-white/10 bg-white/10 backdrop-blur-sm p-5">
              <div className="relative">
                <img
                  className="h-24 w-24 md:h-32 md:w-32 rounded-full ring-4 ring-white/70 object-cover"
                  src={profileUser.profile_image || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"}
                  alt="Foto de perfil"
                />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="font-extrabold text-2xl md:text-3xl tracking-tight bg-gradient-to-br from-green-250 to-brown-250 bg-clip-text text-transparent">
                  {profileUser.first_name || "No especificado"} {profileUser.last_name || ""}
                </h2>
                <div className="mt-1 inline-flex items-center gap-2 text-white/90">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 7.5l8.4 5.6a2.25 2.25 0 002.5 0L22 7.5M4.5 6h15A1.5 1.5 0 0121 7.5v9A1.5 1.5 0 0119.5 18h-15A1.5 1.5 0 013 16.5v-9A1.5 1.5 0 014.5 6z" />
                  </svg>
                  <span className="text-sm">{profileUser.email}</span>
                </div>
              </div>
            </header>

            <section className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl bg-white/10 ring-1 ring-white/10 p-4">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M2 5.5c0-1.1.9-2 2-2h1.1c.5 0 1 .3 1.2.8l1.1 2.5c.2.4.1.9-.2 1.2l-1 1a16 16 0 006.9 6.9l1-1c.3-.3.8-.4 1.2-.2l2.5 1.1c.5.2.8.7.8 1.2V20c0 1.1-.9 2-2 2H18A16 16 0 012 6.5V5.5z" />
                  </svg>
                  <p className="break-words">
                    <span className="font-semibold">Teléfono: </span>
                    {profileUser.phone_number || "No especificado"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 ring-1 ring-white/10 p-4">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.1-7-11a7 7 0 1114 0c0 5.9-7 11-7 11z" />
                    <circle cx="12" cy="10" r="2.5" strokeWidth="1.5" />
                  </svg>
                  <p className="break-words">
                    <span className="font-semibold">Dirección: </span>
                    {profileUser.address || "No especificado"}
                  </p>
                </div>
              </div>
            </section>

            {(!store.currentUser?.is_admin && String(profileUser?.id) === String(store.currentUser?.id)) && (
              <nav className="flex flex-wrap justify-center gap-3 text-xs md:text-sm">
                <Link to="/bookings" className="px-3 py-2 rounded-full ring-1 ring-white/15 bg-white/10 hover:bg-white/20 hover:scale-[1.02]">
                  Ver mis reservas
                </Link>
                <Link to="/user-reviews" className="px-3 py-2 rounded-full ring-1 ring-white/15 bg-white/10 hover:bg-white/20 hover:scale-[1.02]">
                  Ver mis reseñas
                </Link>
                <button onClick={() => setIsOpen(true)} className="px-3 py-2 rounded-full ring-1 ring-white/15 bg-white/10 hover:bg-white/20 hover:scale-[1.02]">
                  Borrar mi cuenta
                </button>
              </nav>
            )}

            <div className="hidden md:flex justify-between gap-3">
              <button
                onClick={handleBackProfile}
                className="bg-gradient-to-br from-brown-250 to-green-250 rounded-3xl border border-brown-250 text-center text-sm md:text-base md:w-1/3 p-2 hover:scale-[1.02] text-white"
              >
                ← Ir a Home
              </button>
              {(!store.currentUser?.is_admin && String(profileUser?.id) === String(store.currentUser?.id)) && (
                <Link
                  to="/edit-profile"
                  className="bg-gradient-to-br from-brown-550 to-green-450 rounded-3xl border border-brown-250 text-center text-sm md:text-base md:w-1/3 p-2 hover:scale-[1.02] text-white"
                >
                  Modificar
                </Link>
              )}
            </div>

            <div className="md:hidden flex flex-col justify-between gap-3">
              {(!store.currentUser?.is_admin && String(profileUser?.id) === String(store.currentUser?.id)) && (
                <Link
                  to="/edit-profile"
                  className="bg-gradient-to-br from-brown-550 to-green-450 rounded-3xl border border-brown-250 text-center text-sm md:text-base p-2 hover:scale-[1.02] text-white"
                >
                  Modificar
                </Link>
              )}
              <button
                onClick={handleBackProfile}
                className="bg-gradient-to-br from-brown-250 to-green-250 rounded-3xl border border-brown-250 text-center text-sm md:text-base p-2 hover:scale-[1.02] text-white"
              >
                ← Volver atrás
              </button>
            </div>

          </div>
        </div>
      )}

      {loadingGuest && (
        <div className="flex justify-center items-center min-h-[100svh] p-4">
          <div className="text-white/80">Cargando perfil...</div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white text-stone-900 shadow-2xl overflow-hidden">
            <div className="flex items-start gap-4 border-b p-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="shrink-0">
                <path d="M12 9v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 17h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg md:text-xl font-semibold">Estás por eliminar tu cuenta permanentemente</h3>
                  <button type="button" onClick={() => setIsOpen(false)} className="text-stone-500 hover:text-stone-700 ml-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 text-sm md:text-base">
                  <p>¿Confirmas que deseas continuar? Esta acción:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Borrará tu perfil y toda tu información</li>
                    <li>Eliminará tu historial</li>
                    <li>No podrá revertirse</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="md:hidden flex flex-col justify-end gap-2 border-t p-4">
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={processingDeactivate}
                className={`px-6 py-2 rounded-3xl text-white bg-gradient-to-br from-brown-550 to-green-450 border border-brown-250 hover:scale-[1.02] ${processingDeactivate ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {processingDeactivate ? 'Procesando...' : 'Aceptar'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-3xl text-sm md:text-base p-2 text-white bg-gradient-to-br from-brown-250 to-green-250 border border-brown-250 hover:scale-[1.02]"
              >
                Cancelar
              </button>
            </div>

            <div className="hidden md:flex justify-end gap-2 border-t p-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-3xl text-sm md:text-base p-2 text-white bg-gradient-to-br from-brown-250 to-green-250 border border-brown-250 hover:scale-[1.02]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={processingDeactivate}
                className={`px-6 py-2 rounded-3xl text-white bg-gradient-to-br from-brown-550 to-green-450 border border-brown-250 hover:scale-[1.02] ${processingDeactivate ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {processingDeactivate ? 'Procesando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}