import { useEffect, useState } from 'react'
import useGlobalReducer from '../hooks/useGlobalReducer'
import { getAllReviews } from '../services/reviews'

export const Reviews = () => {
  const { store } = useGlobalReducer()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadReviews = async () => {
      try {
        if (!store.currentUser?.is_admin) {
          setError('No tiene permisos')
          return
        }
        const data = await getAllReviews()
        const list = data?.results || data || []
        setReviews(Array.isArray(list) ? list : [])
      } catch (error) {
        setError(error.message || 'Error al cargar las reseñas')
      } finally {
        setLoading(false)
      }
    }
    loadReviews()
  }, [store.currentUser?.id])

  if (loading) {
    return (
      <div className="bg-hero text-white">
        <div className="container mx-auto px-4 py-12 min-h-[100svh]">
          <h1 className="text-4xl text-center md:text-6xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">Reseñas</span>
          </h1>
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50 mb-8" />
          <div className="mx-auto max-w-xl rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 p-8 text-center shadow-2xl">
            <p className="text-white/90">Cargando reseñas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-hero text-white">
        <div className="container mx-auto px-4 py-12 min-h-[100svh]">
          <h1 className="text-4xl text-center md:text-6xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">Reseñas</span>
          </h1>
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50 mb-8" />
          <div className="mx-auto max-w-xl rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 p-8 text-center shadow-2xl">
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-hero text-white bg-black/50">
      <div className="container mx-auto px-4 py-12 min-h-[100svh]">
        <h1 className="text-4xl text-center md:text-6xl lg:text-8xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">Reseñas</span>
        </h1>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50 mb-8" />

        {reviews.length === 0 ? (
          store.currentUser?.is_admin ? (
            <div className="mx-auto max-w-xl rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 p-8 text-center shadow-2xl">
              <p className="text-white/90 text-xl">Aún no hay reseñas</p>
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 p-8 text-center shadow-2xl">
              <p className="text-white/90 text-xl">Aún no has dejado reseñas</p>
            </div>
          )
        ) : (
          <ul className="space-y-4 max-w-3xl mx-auto">
            {reviews.map(review => (
              <li
                key={review.id}
                className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 p-5 shadow-xl"
              >
                <div className="flex justify-end">
                  <span className="text-yellow-300 font-bold">{review.rating} ★</span>
                </div>
                <p className="text-white/90 mt-2 break-words">{review.comment}</p>
                <p className="text-white/60 text-sm mt-2">
                  {new Date(review.created_at).toLocaleDateString('es-ES')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}