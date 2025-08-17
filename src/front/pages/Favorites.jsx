import React, { useEffect } from 'react'
import { getFavorites, addFavorite, removeFavorite } from '../services/favorites'
import useGlobalReducer from '../hooks/useGlobalReducer'
import { Link, useNavigate } from 'react-router-dom'

export const Favorites = () => {
  const { store, dispatch } = useGlobalReducer()
  const navigate = useNavigate()

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const { results } = await getFavorites()
        dispatch({ type: 'favorites', payload: results })
      } catch {}
    }
    loadFavorites()
  }, [])

  const handleFavorite = async hutId => {
    try {
      const existing = store.favorites.find(fav => fav.hut_id === hutId)
      if (existing) {
        await removeFavorite(existing.id)
        dispatch({ type: 'remove_favorites', payload: existing.id })
      } else {
        const result = await addFavorite(hutId)
        dispatch({ type: 'add_favorites', payload: result.results })
      }
    } catch {}
  }

  const isFavorite = hutId => store.favorites.some(favorite => favorite.hut_id === hutId)

  return (
    <div className="bg-hero text-white bg-black/50">
      <div className="container mx-auto px-4 py-12 min-h-[100svh]">
        <h1 className="text-4xl text-center md:text-6xl lg:text-8xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">
            Mis Cabañas Favoritas
          </span>
        </h1>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50 mb-8" />

        {store.favorites.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 p-8 text-center shadow-2xl">
            <p className="text-white/90 text-xl mb-6">No tienes favoritos actualmente</p>
            <button
              onClick={() => navigate('/huts')}
              className="rounded-full bg-gradient-to-br from-brown-550 to-green-450 px-8 py-3 text-white shadow-lg hover:scale-[1.02] transition"
            >
              Explorar cabañas disponibles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {store.favorites.map(favorite => (
              <div
                key={favorite.id}
                className="relative rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 shadow-2xl overflow-hidden"
              >
                {!store.currentUser?.is_admin && (
                  <button
                    onClick={() => handleFavorite(favorite.hut_id)}
                    className="absolute z-10 top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 text-red-500 shadow"
                    aria-label={isFavorite(favorite.hut_id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  >
                    {isFavorite(favorite.hut_id) ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 017.5 3c1.74 0 3.41.81 4.5 2.09A6 6 0 0120 3.5a5.5 5.5 0 01.5 8.28l-.03.03-7.11 7.04A1 1 0 0112 21.35z" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500">
                        <path d="M12.1 21.35l-1.1-1.01C5.14 15.28 2 12.39 2 8.5 2 6 4 4 6.5 4c1.54 0 3.04.99 3.57 2.36h.01C10.61 4.99 12.1 4 13.64 4 16.14 4 18 6 18 8.5c0 3.89-3.14 6.78-8.9 11.84z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                )}

                <div className="relative">
                  <img
                    src={favorite.hut_image_url || 'https://via.placeholder.com/600x400'}
                    alt={favorite.hut_name}
                    className="w-full h-56 object-cover"
                    onError={e => {
                      e.currentTarget.src = 'https://via.placeholder.com/600x400'
                      e.currentTarget.alt = 'Imagen no disponible'
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-xl font-extrabold truncate bg-gradient-to-br from-green-450 to-brown-250 bg-clip-text text-transparent">
                        {favorite.hut_name}
                      </h2>
                      <span className="text-sm text-white/80 truncate block">
                        {favorite.hut_to?.location_to?.region}
                      </span>
                    </div>

                    <Link
                      to={`/huts/${favorite.hut_id}`}
                      className="flex-none rounded-3xl bg-gradient-to-br from-brown-250 to-green-250 border border-brown-250 px-4 py-2 text-sm text-white hover:scale-[1.02] transition"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}