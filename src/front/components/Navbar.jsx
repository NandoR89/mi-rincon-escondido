import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket, faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'

export const Navbar = () => {
  const [menuIsActive, setMenuIsActive] = useState(false)
  const { store, dispatch } = useGlobalReducer()
  const navigate = useNavigate()
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const isLogged = store.isLogged

  const handleMenu = () => setMenuIsActive(!menuIsActive)

  const handleLogout = (event) => {
    if (isLogged) {
      event.preventDefault()
      const confirmLogout = window.confirm('¿Estás seguro que deseas cerrar sesión?')
      if (confirmLogout) {
        dispatch({ type: 'logout' })
        toast.info('Te has desconectado', {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        })
        navigate('/login')
      }
    }
  }

  const linkHover =
    "px-3 py-1 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-green-200 hover:ring-1 hover:ring-green-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/60"

  const mobileLink =
    "group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex items-center px-4 py-3 gap-4 transition-all duration-200 hover:bg-white/10 hover:ring-1 hover:ring-green-400/40 hover:translate-x-1"

  const mobileText =
    "text-white transition-all duration-200 group-hover:text-green-200 group-hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.85)]"

  return (
    <nav className="relative text-xl text-white">
      <ul className="relative flex items-center bg-black/90 py-3 px-3 md:px-5 lg:px-16">
        <li className="md:hidden" onClick={handleMenu}>
          {!menuIsActive ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="transition-transform hover:scale-105">
              <path d="M4 8h16M4 16h16" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="transition-transform hover:scale-105">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          )}
        </li>

        <li className="absolute left-1/2 -translate-x-1/2 md:static">
          <Link to="/" onClick={() => setMenuIsActive(false)} className="inline-flex items-center justify-center">
            <svg className="transition-transform duration-150 md:hover:scale-105 origin-center" fill="#ffffff" height="40px" width="40px" viewBox="0 0 479 479" stroke="#ffffff">
              <g><path d="M394.902,95.52L242.667,0.904c-1.939-1.205-4.395-1.205-6.334,0L84.097,95.52c-1.762,1.095-2.833,3.021-2.833,5.096v26.004 c0,2.179,1.181,4.186,3.085,5.244c1.903,1.06,4.232,1.002,6.082-0.148l7.703-4.788v196.231c0,3.313,2.687,6,6,6h4.642v24.653 c0,3.313,2.687,6,6,6h19.082V473c0,3.313,2.687,6,6,6h22.754c3.313,0,6-2.687,6-6v-50.77l62.407-62.418h16.959l62.407,62.418V473 c0,3.313,2.687,6,6,6h22.754c3.313,0,6-2.687,6-6V359.812h19.082c3.313,0,6-2.687,6-6v-24.653h4.642c3.313,0,6-2.687,6-6V126.927 l7.704,4.788c0.968,0.602,2.066,0.904,3.167,0.904c1.003,0,2.008-0.251,2.915-0.756c1.904-1.059,3.085-3.065,3.085-5.244v-26.004 C397.735,98.542,396.664,96.615,394.902,95.52z"/></g>
            </svg>
          </Link>
        </li>

        <div className="hidden md:flex md:items-center md:gap-4 md:ml-auto">
          <li><Link to="/huts" className={`hidden md:block ${linkHover}`}>Cabañas</Link></li>
          {token && <li><Link to="/bookings" className={`hidden md:block ${linkHover}`}>Reservas</Link></li>}
          {token && !store.currentUser.is_admin && <li><Link to="/favorites" className={`hidden md:block ${linkHover}`}>Favoritos</Link></li>}
          {!store.currentUser?.is_admin && <li><Link to="/contact" className={`hidden md:block ${linkHover}`}>Contacto</Link></li>}
          {token && !store.currentUser.is_admin && <li><Link to={`/profile/${store.currentUser.id}`} className={`hidden md:block ${linkHover}`}>Mi Perfil</Link></li>}
          {isLogged && store.currentUser.is_admin && <li><Link to="/reviews" className={`hidden md:block ${linkHover}`}>Reseñas</Link></li>}
        </div>

        <li className="ml-auto md:ml-6 flex items-center gap-2" onClick={() => setMenuIsActive(false)}>
          {isLogged && store.currentUser?.is_admin && (
            <>
              <span className="hidden md:inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-600/80 text-white">admin</span>
              <span className="md:hidden ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-600/80 text-white">admin</span>
            </>
          )}
          <Link to="/login" onClick={handleLogout} className="md:hover:scale-105 transition-transform">
            {isLogged ? (
              <FontAwesomeIcon
                icon={faRightFromBracket}
                size="xl"
                className="md:hover:text-red-400 transition-colors"
              />
            ) : (
              <FontAwesomeIcon
                icon={faUserCircle}
                size="xl"
                className="text-white hover:text-green-350 transition-colors"
              />
            )}
          </Link>
        </li>
      </ul>

      {menuIsActive && (
        <div className="bg-black w-full h-screen absolute z-50 text-3xl font-bold md:hidden">
          <ul className="flex flex-col gap-4 w-full p-4">
            <li>
              <Link to="/huts" onClick={() => setMenuIsActive(false)} className={mobileLink}>
                <svg xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-200 ease-out group-hover:scale-[1.18] group-hover:-rotate-6" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
                  <path d="M5 12H3l9-9 9 9h-2" />
                  <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
                </svg>
                <span className={mobileText}>Cabañas</span>
              </Link>
            </li>

            {token && (
              <li>
                <Link to="/bookings" onClick={() => setMenuIsActive(false)} className={mobileLink}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="transition-transform duration-200 ease-out group-hover:scale-[1.18] group-hover:-rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                  </svg>
                  <span className={mobileText}>Reservas</span>
                </Link>
              </li>
            )}

            {token && !store.currentUser.is_admin && (
              <li>
                <Link to="/favorites" onClick={() => setMenuIsActive(false)} className={mobileLink}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="transition-transform duration-200 ease-out group-hover:scale-[1.18] group-hover:-rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
                    <path d="M12 21l-7.5-7.43a5 5 0 0 1 7.5-6.57 5 5 0 0 1 7.5 6.57z" />
                  </svg>
                  <span className={mobileText}>Favoritos</span>
                </Link>
              </li>
            )}

            {!store.currentUser?.is_admin && (
              <li>
                <Link to="/contact" onClick={() => setMenuIsActive(false)} className={mobileLink}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="transition-transform duration-200 ease-out group-hover:scale-[1.18] group-hover:-rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                  <span className={mobileText}>Contacto</span>
                </Link>
              </li>
            )}

            {token && !store.currentUser.is_admin && (
              <li>
                <Link to={`/profile/${store.currentUser.id}`} onClick={() => setMenuIsActive(false)} className={mobileLink}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="transition-transform duration-200 ease-out group-hover:scale-[1.18] group-hover:-rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
                  </svg>
                  <span className={mobileText}>Mi perfil</span>
                </Link>
              </li>
            )}

            {isLogged && store.currentUser.is_admin && (
              <li>
                <Link to="/reviews" onClick={() => setMenuIsActive(false)} className={mobileLink}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="transition-transform duration-200 ease-out group-hover:scale-[1.18] group-hover:-rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                  <span className={mobileText}>Reseñas</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  )
}