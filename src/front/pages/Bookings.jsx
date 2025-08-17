import React, { useState, useEffect } from 'react'
import { Link, useNavigate, Form, useParams } from 'react-router-dom'
import { getBookingsDetail, deleteBooking } from '../services/book'
import useGlobalReducer from "../hooks/useGlobalReducer"
import { calculateNights, calculateTotalStayCost } from '../tools/utilFunctions'
import BuyButtonComponent from '../components/BuyButton'
import { postReview } from '../services/reviews'
import { toast } from 'react-toastify'

const StarRating = ({ rating = 0, onRatingChange = () => { } }) => {
  const [hoverRating, setHoverRating] = useState(0)
  return (
    <div className="flex justify-center my-4">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className="focus:outline-none"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        >
          <svg
            className={`w-8 h-8 mx-1 ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 22 20"
          >
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

const Bookings = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const navigate = useNavigate()
  const { store, dispatch } = useGlobalReducer()
  const bookings = store.bookingsDetail
  const [isOpen, setIsOpen] = useState(false)
  const [activeBooking, setActiveBooking] = useState(null)
  const currentUser = store.currentUser
  const { id } = useParams()
  const users = store.users
  const [formData, setFormData] = useState({ title: "", comment: "", rating: 4 })

  useEffect(() => {
    const getBookings = async () => {
      try {
        const bookingsData = await getBookingsDetail()
        dispatch({ type: "bookingsDetail", payload: bookingsData })
      } catch (err) {
        setError(err.message)
        if (err.message.includes('Sesión expirada')) {
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
        }
      } finally {
        setLoading(false)
      }
    }
    getBookings()
  }, [])

  const handleCancelBooking = async bookingId => {
    const isactive = window.confirm('¿Estás seguro que deseas cancelar esta reserva?')
    if (!isactive) return
    setCancellingId(bookingId)
    try {
      await deleteBooking(bookingId)
      const bookingsData = await getBookingsDetail()
      dispatch({ type: "bookingsDetail", payload: bookingsData })
      setSuccessMessage('Reserva cancelada exitosamente')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err.message)
      if (err.message.includes('Sesión expirada')) {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
      }
    } finally {
      setCancellingId(null)
    }
  }

  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('es-ES', options)
  }

  const handleReview = async event => {
    event.preventDefault()
    try {
      if (!formData.title.trim() || !formData.comment.trim()) {
        toast.warning('Por favor completa todos los campos', { position: "top-center", autoClose: 3000, theme: "colored" })
        return
      }
      if (!activeBooking) throw new Error("No se encontró la reserva")
      const newReview = await postReview(activeBooking.hut_to.id, formData)
      dispatch({ type: 'reviews', payload: newReview })
      setFormData({ title: "", comment: "", rating: 4 })
      setIsOpen(false)
      setActiveBooking(null)
      toast.success('La reseña se ha añadido correctamente.', { position: "top-center", autoClose: 3000, theme: "colored" })
    } catch (error) {
      console.error("Error al enviar reseña:", error)
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="bg-hero text-white">
        <div className="min-h-[100svh] flex items-center justify-center px-6">
          <div className="w-full max-w-2xl space-y-4">
            <div className="h-6 w-48 bg-white/20 rounded animate-pulse mx-auto" />
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 p-6 animate-pulse">
                <div className="h-4 w-32 bg-white/20 rounded mb-3" />
                <div className="h-4 w-full bg-white/20 rounded mb-2" />
                <div className="h-4 w-3/5 bg-white/20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-hero text-white">
        <div className="min-h-[100svh] flex items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 p-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">Reservas</span>
            </h1>
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 mb-6" />
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="rounded-full bg-gradient-to-br from-brown-550 to-green-450 px-6 py-3 font-medium text-white shadow-lg hover:scale-[1.02] transition"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-hero text-white bg-black/50">
      <div className="min-h-[100svh] px-4 py-12">
        <h1 className="text-4xl text-center md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          {store.currentUser?.is_admin
            ? <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">Reservas</span>
            : <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">Mis Reservas</span>}
        </h1>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50 mb-10" />

        {bookings.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 p-8 text-center shadow-2xl">
            <p className="text-white/90 text-xl mb-6">No tienes reservas actualmente</p>
            <button
              onClick={() => navigate('/huts')}
              className="rounded-full bg-gradient-to-br from-brown-550 to-green-450 px-8 py-3 font-medium text-white shadow-lg hover:scale-[1.02] transition"
            >
              Explorar cabañas disponibles
            </button>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            {bookings.map(booking => (
              <div key={booking.id} className="rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 shadow-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="md:w-2/3">
                      <h2 className="text-2xl font-bold bg-gradient-to-br from-green-450 to-brown-250 bg-clip-text text-transparent mb-1">
                        {booking.hut_to.name}
                      </h2>
                      <p className="text-white/90 mb-4">{booking.hut_to.location_to.city}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm sm:text-base">
                        <div className="rounded-xl bg-white/10 ring-1 ring-white/10 p-3">
                          <p className="text-white/70">Check-in</p>
                          <p className="font-semibold">{formatDate(booking.start_date)}</p>
                        </div>
                        <div className="rounded-xl bg-white/10 ring-1 ring-white/10 p-3">
                          <p className="text-white/70">Check-out</p>
                          <p className="font-semibold">{formatDate(booking.end_date)}</p>
                        </div>
                        <div className="rounded-xl bg-white/10 ring-1 ring-white/10 p-3">
                          <p className="text-white/70">Noches</p>
                          <p className="font-semibold">{calculateNights(booking.start_date, booking.end_date)}</p>
                        </div>
                        <div className="rounded-xl bg-white/10 ring-1 ring-white/10 p-3">
                          <p className="text-white/70">Huéspedes</p>
                          <p className="font-semibold">{booking.guests}</p>
                        </div>
                      </div>
                    </div>

                    <div className="md:w-1/3 md:pl-4">
                      <div className="rounded-2xl bg-white/10 ring-1 ring-white/10 p-4 text-center">
                        <p className="text-sm text-white/80 mb-1">Total</p>
                        <p className="text-2xl font-extrabold text-white">
                          {calculateTotalStayCost(booking.hut_to.price_per_night, calculateNights(booking.start_date, booking.end_date))} €
                        </p>
                      </div>

                      <div className="mt-4 space-y-3 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          {currentUser?.is_admin && (
                            <button
                              onClick={() => navigate(`/profile/${booking.user_id}`)}
                              className="flex-1 rounded-full bg-gradient-to-br from-brown-450 to-brown-550 px-4 py-2 text-white shadow hover:scale-[1.02] transition"
                            >
                              Ver huésped
                            </button>
                          )}
                          {!currentUser?.is_admin && (
                              <button
                                onClick={() => { setActiveBooking(booking); setIsOpen(true) }}
                                className="flex-1 rounded-full bg-gradient-to-br from-green-350 to-green-550 px-4 py-2 text-white shadow hover:scale-[1.02] transition"
                              >
                                Deja tu reseña
                              </button>
                            )}
                        </div>

                        <div className="flex flex-col lg:flex-row gap-2">
                          <button
                            onClick={() => navigate(`/current-booking/${booking.id}`)}
                            className="flex-1 rounded-full bg-gradient-to-br from-brown-450 to-brown-550 px-4 py-2 text-white shadow hover:scale-[1.02] transition"
                          >
                            Ver reserva
                          </button>
                          <button
                            onClick={() => navigate(`/huts/${booking.hut_to.id}`)}
                            className="flex-1 rounded-full bg-gradient-to-br from-brown-450 to-brown-550 px-4 py-2 text-white shadow hover:scale-[1.02] transition"
                          >
                            Ver cabaña
                          </button>
                        </div>

                        <div className="flex flex-col items-center overflow-hidden">
                          {!currentUser?.is_admin && (
                            <stripe-buy-button
                              buy-button-id="buy_btn_1Rv7GQEtAORreSL7tnocAHYB"
                              publishable-key="pk_test_51RqDDmEtAORreSL72MG2GvWCRmOpqvFUiavX1SxF0mCGgSfboGFJzfNojRPTzYJlU9uHBVVLxytkxbctJQd9wUpG00qklO3xus"
                            />
                          )}
                          {(booking.status_reserved === 'active' &&
                            (currentUser?.id === booking.user_id || currentUser?.is_admin)) && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancellingId === booking.id}
                                className={`mt-3 flex-1 rounded-full px-4 py-2 text-white shadow transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${cancellingId === booking.id ? 'bg-red-600/70 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                              >
                                {cancellingId === booking.id ? (
                                  <span className="inline-flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Cancelando...
                                  </span>
                                ) : (
                                  'Cancelar reserva'
                                )}
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {booking.status_reserved === 'pending' && (
                  <div className="px-6 py-3 bg-white/10 ring-1 ring-white/10">
                    <p className="text-white/90 font-medium flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-350 mr-2"></span>
                      Confirmación pendiente
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <Form onSubmit={handleReview} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white text-stone-900 shadow-2xl overflow-hidden">
            <div className="border-b p-4">
              <h3 className="text-center font-semibold">Comparte tu experiencia</h3>
            </div>
            <div className="p-4 space-y-3">
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-350"
                placeholder="Título"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
              <textarea
                className="w-full min-h-[120px] md:min-h-[180px] max-h-[320px] border-2 border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-350"
                placeholder="Escribe aquí"
                value={formData.comment}
                onChange={e => setFormData({ ...formData, comment: e.target.value })}
              />
              <div className="w-full text-center">
                <p className="text-sm text-gray-600 mb-2">Valora tu experiencia</p>
                <StarRating
                  rating={formData.rating}
                  onRatingChange={value => setFormData({ ...formData, rating: value })}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.rating} {formData.rating === 1 ? 'estrella' : 'estrellas'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 border-t p-4">
              <button
                type="button"
                onClick={() => { setIsOpen(false); setActiveBooking(null) }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-full text-white bg-gradient-to-br from-brown-550 to-green-450 border border-brown-250 hover:scale-[1.02] transition"
              >
                Aceptar
              </button>
            </div>
          </div>
        </Form>
      )}
    </div>
  )
}

export default Bookings