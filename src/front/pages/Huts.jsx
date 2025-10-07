import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { getHutsDetail } from '../services/hut'
import { createBooking } from '../services/book'
import { getFavorites, addFavorite, removeFavorite } from '../services/favorites'
import useGlobalReducer from '../hooks/useGlobalReducer'
import { format } from 'date-fns'

const Huts = () => {
  const { store, dispatch } = useGlobalReducer()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedHut, setSelectedHut] = useState(null)
  const isLogged =
    store.isLogged ||
    !!store.token ||
    !!localStorage.getItem('token') ||
    !!sessionStorage.getItem('token')
  const [bookingData, setBookingData] = useState({
    start_date: '',
    end_date: '',
    guests: 1,
    special_requests: ''
  })
  const [bookingError, setBookingError] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  useEffect(() => {
    const fetchHuts = async () => {
      try {
        setLoading(true)
        setError(null)
        const hutsData = await getHutsDetail()
        if (!hutsData) {
          throw new Error('No se recibieron datos de las cabañas')
        }
        dispatch({ type: 'hutsDetail', payload: hutsData })
      } catch (err) {
        setError({
          message: 'No se pudo cargar la información de las cabañas',
          details: err.message
        })
      } finally {
        setLoading(false)
      }
    }
    fetchHuts()
  }, [dispatch])

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLogged) return
      try {
        const res = await getFavorites()
        dispatch({ type: 'favorites', payload: res.results })
      } catch (err) {}
    }
    fetchFavorites()
  }, [isLogged, dispatch])

  const totalPages = Math.max(1, Math.ceil(store.hutsDetail.length / pageSize))
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const paginatedHuts = store.hutsDetail.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleReserveClick = (hut) => {
    setSelectedHut(hut)
    setShowModal(true)
    setBookingData({
      start_date: '',
      end_date: '',
      guests: 1,
      special_requests: ''
    })
    setBookingError(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedHut(null)
    setBookingSuccess(false)
  }

  const handleBookingChange = (event) => {
    const { name, value } = event.target
    setBookingData((prev) => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) : value
    }))
  }

  const handleBookingSubmit = async (event) => {
    event.preventDefault()
    setBookingError(null)
    if (!bookingData.start_date || !bookingData.end_date) {
      setBookingError('Debes seleccionar fechas de inicio y fin')
      return
    }
    try {
      const bookingPayload = {
        hut_id: selectedHut.id,
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        guests: bookingData.guests,
        special_requests: bookingData.special_requests
      }
      const response = await createBooking(bookingPayload)
      if (response.success) {
        setBookingSuccess(true)
        dispatch({ type: 'bookingsDetail', payload: bookingPayload })
        setBookingError(null)
      } else {
        throw new Error(response.message || 'Error al realizar la reserva')
      }
    } catch (err) {
      setBookingError(err.message || 'Error al procesar la reserva')
    }
  }

  const handleFavorite = async (hut) => {
    try {
      const existing = store.favorites.find((fav) => fav.hut_id === hut.id)
      if (existing) {
        await removeFavorite(existing.id)
        dispatch({ type: 'remove_favorites', payload: existing.id })
      } else {
        const result = await addFavorite(hut.id)
        dispatch({ type: 'add_favorites', payload: result.results })
      }
    } catch (err) {}
  }

  const isFavorite = (hutId) => {
    return store.favorites.some((favorite) => favorite.hut_id === hutId)
  }

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-550 mb-4"></div>
        <p className="text-lg text-brown-550">Cargando cabañas...</p>
      </div>
    )

  if (error)
    return (
      <div className="bg-brown-150 border-2 border-brown-250 rounded-lg p-8 text-center shadow-sm">
        <p className="text-brown-550 text-xl mb-6">No tienes reservas actualmente</p>
        <button
          onClick={() => navigate('/huts')}
          className="bg-green-350 hover:bg-green-450 text-white font-bold py-3 px-8 rounded-md shadow-md transition-all hover:shadow-lg"
        >
          Explorar Cabañas Disponibles
        </button>
      </div>
    )

  return (
    <div className="mx-auto px-4 py-12 bg-black/50 min-h-screen">
      <h1 className="text-4xl text-center md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
        <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">
          Nuestras Cabañas
        </span>
      </h1>
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50 mb-8"></div>

      {store.currentUser?.is_admin && (
        <div
          className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 mb-10 border-2 border-dashed border-green-350 flex flex-col items-center justify-center cursor-pointer h-full min-h-[320px] sm:min-h-[350px] md:min-h-[380px]"
          onClick={() => (window.location.href = '/huts/new')}
        >
          <div className="text-center p-5 w-full">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-3">
              <svg
                className="h-8 w-8 text-green-550"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-green-550 mb-1">Añadir cabaña</h3>
            <p className="text-sm text-brown-450 px-2">Crear nueva cabaña</p>
          </div>
        </div>
      )}

      {store.hutsDetail.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 p-8 text-center shadow-2xl">
          <p className="text-white/90 text-xl mb-6">No hay cabañas disponibles</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-gradient-to-br from-brown-550 to-green-450 px-8 py-3 font-medium text-white shadow-lg hover:scale-[1.02] transition"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <section className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedHuts.map((hut) => (
                <div
                  key={hut.id}
                  className="relative bg-white border-4 border-brown-250 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duración-300"
                >
                  {isLogged && !store.currentUser?.is_admin && (
                    <button
                      onClick={() => handleFavorite(hut)}
                      className="absolute z-40 inline-flex items-center justify-center w-12 h-8 text-xs font-bold bg-neutral-100 border-2 border-black rounded-full top-2 end-2"
                    >
                      {isFavorite(hut.id) ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 017.5 3c1.74 0 3.41.81 4.5 2.09A6 6 0 0120 3.5a5.5 5.5 0 01.5 8.28l-.03.03-7.11 7.04A1 1 0 0112 21.35z" />
                        </svg>
                      ) : (
                                               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M12.1 21.35l-1.1-1.01C5.14 15.28 2 12.39 2 8.5 2 6 4 4 6.5 4c1.54 0 3.04.99 3.57 2.36h.01C10.61 4.99 12.1 4 13.64 4 16.14 4 18 6 18 8.5c0 3.89-3.14 6.78-8.9 11.84z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  )}
                  <div className="relative">
                    <img
                      src={hut.image_url || 'https://via.placeholder.com/400x300'}
                      alt={hut.name || 'Cabaña'}
                      className="w-full h-60 object-cover"
                      onError={(event) => {
                        event.target.src = 'https://via.placeholder.com/400x300'
                        event.target.alt = 'Imagen no disponible'
                      }}
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h2 className="text-xl font-bold text-green-550 truncate">{hut.name || 'Cabaña'}</h2>
                        <span className="text-sm font-sm text-green-550 truncate">{hut.location_to?.region}</span>
                      </div>
                      <span className="text-lg font-semibold text-brown-550 whitespace-nowrap">
                        ${hut.price_per_night || '0'}
                        <span className="text-sm font-normal text-brown-350">/noche</span>
                      </span>
                    </div>

                    <p className="text-brown-450 mb-4 line-clamp-2 min-h-[80px] overflow-y-auto">
                      {hut.description || 'Descripción no disponible'}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mb-5">
                      <div className="bg-green-100 rounded-lg p-2 text-center">
                        <p className="text-xs text-green-550">Huéspedes</p>
                        <p className="font-semibold text-brown-550">{hut.capacity || '-'}</p>
                      </div>
                      <div className="bg-green-100 rounded-lg p-2 text-center">
                        <p className="text-xs text-green-550">Dormitorios</p>
                        <p className="font-semibold text-brown-550">{hut.bedrooms || '-'}</p>
                      </div>
                      <div className="bg-green-100 rounded-lg p-2 text-center">
                        <p className="text-xs text-green-550">Baños</p>
                        <p className="font-semibold text-brown-550">{hut.bathroom || '-'}</p>
                      </div>
                    </div>

                    <div className="flex justify-between gap-3">
                      <Link
                        to={`/huts/${hut.id}`}
                        className="flex-1 bg-gradient-to-br from-brown-250 to-green-250 rounded-3xl border border-brown-250 text-center text-sm md:text-base md:w-1/4 p-2 hover:scale-[1.02] text-white"
                      >
                        Ver detalles
                      </Link>
                      {!store.currentUser.is_admin && (
                        <button
                          onClick={() => handleReserveClick(hut)}
                          className="flex-1 bg-gradient-to-br from-brown-550 to-green-450 rounded-3xl border border-brown-250 text-center text-sm md:text-base md:w-1/4 p-2 hover:scale-[1.02] text-white"
                        >
                          Reservar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-6 z-30 flex justify-end pointer-events-none mt-4">
              <button
                onClick={() => (window.location.href = '/maps')}
                className="pointer-events-auto bg-gradient-to-br from-brown-550 to-green-450 border border-brown-250 text-white rounded-3xl shadow-lg font-semibold py-3 px-6 transition-transform hover:scale-[1.02] flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Abrir Mapa
              </button>
            </div>
          </section>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg border ${
                currentPage === 1
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'border-green-350 text-green-550 hover:bg-green-50'
              }`}
            >
              Anterior
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-10 h-10 rounded-lg border text-sm font-medium ${
                  currentPage === page
                    ? 'bg-green-450 text-white border-green-450'
                    : 'border-green-350 text-green-550 hover:bg-green-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage - 0 + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg border ${
                currentPage === totalPages
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'border-green-350 text-green-550 hover:bg-green-50'
              }`}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {showModal && selectedHut && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 bg-green-100 border-b">
              <h3 className="text-xl font-bold text-green-550">
                {isLogged ? `Reservar ${selectedHut.name}` : 'Regístrate para reservar'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-brown-550 hover:text-brown-350 text-2xl"
                aria-label="Cerrar modal"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              {bookingSuccess ? (
                <div className="text-center">
                  <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-lg font-medium text-green-550 mt-4">¡Reserva confirmada!</h3>
                  <p className="mt-2 text-brown-450">Tu reserva en {selectedHut.name} ha sido confirmada.</p>
                  <button
                    onClick={() => (window.location.href = '/bookings')}
                    className="mt-6 w-full py-3 bg-green-350 text-white font-medium rounded-lg hover:bg-green-450 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              ) : isLogged ? (
                <form onSubmit={handleBookingSubmit}>
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-brown-550 mb-1">Fecha de llegada</label>
                        <input
                          type="date"
                          name="start_date"
                          value={bookingData.start_date}
                          onChange={handleBookingChange}
                          min={format(new Date(), 'yyyy-MM-dd')}
                          className="w-full p-2 border border-brown-200 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brown-550 mb-1">Fecha de salida</label>
                        <input
                          type="date"
                          name="end_date"
                          value={bookingData.end_date}
                          onChange={handleBookingChange}
                          min={bookingData.start_date || format(new Date(), 'yyyy-MM-dd')}
                          className="w-full p-2 border border-brown-200 rounded-lg"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brown-550 mb-1">
                        Huéspedes (máx. {selectedHut.capacity})
                      </label>
                      <input
                        type="number"
                        name="guests"
                        min="1"
                        max={selectedHut.capacity}
                        value={bookingData.guests}
                        onChange={handleBookingChange}
                        className="w-full p-2 border border-brown-200 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brown-550 mb-1">Solicitudes especiales</label>
                      <textarea
                        name="special_requests"
                        value={bookingData.special_requests}
                        onChange={handleBookingChange}
                        rows="3"
                        className="w-full p-2 border border-brown-200 rounded-lg"
                      />
                    </div>
                  </div>
                  {bookingError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-600 rounded text-sm">{bookingError}</div>
                  )}
                  <button
                    type="submit"
                    className="w-full py-3 bg-green-350 text-white font-medium rounded-lg hover:bg-green-450 transition-colors"
                  >
                    Confirmar Reserva
                  </button>
                </form>
              ) : (
                <button
                  className="btn px-4 py-2 bg-white text-sm md:text-base border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duración-200"
                  onClick={() => (window.location.href = '/login')}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Huts