import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createHut } from '../services/hut'
import { addHutAlbumUrls } from '../services/hutsAlbums'
import useGlobalReducer from '../hooks/useGlobalReducer'

const HutForm = () => {
  const { store } = useGlobalReducer()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [hutData, setHutData] = useState({
    name: '',
    description: '',
    capacity: 2,
    bedrooms: 1,
    bathroom: 1,
    price_per_night: 100,
    location_id: 1,
    image_url: '',
    is_active: true,
    location_coords: { lat: null, lng: null },
    image_file: null,
    image_preview: ''
  })

  const [albumUrls, setAlbumUrls] = useState({
    bedroom: '',
    bathroom: '',
    living_room: '',
    kitchen: '',
    other_picture: ''
  })

  const handleChange = event => {
    const { name, value, checked } = event.target
    setHutData(prev => ({
      ...prev,
      [name]: name === 'is_active' ? checked : value
    }))
  }

  const handleNumberChange = event => {
    const { name, value } = event.target
    setHutData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }))
  }

  const handleAlbumChange = event => {
    const { name, value } = event.target
    setAlbumUrls(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const created = await createHut(hutData)
      const createdHut = created.results || created.hut || created
      const hutId = createdHut?.id
      if (!hutId) throw new Error('No se pudo obtener el ID de la cabaña creada')

      const types = ['bedroom', 'bathroom', 'living_room', 'kitchen', 'other_picture']
      const tasks = []

      types.forEach(type => {
        const single = (albumUrls[type] || '').trim()
        if (single) {
          tasks.push(addHutAlbumUrls({ hut_id: hutId, type, urls: [single] }))
        }
      })

      if (tasks.length) await Promise.all(tasks)

      navigate('/huts')
    } catch (e) {
      setError(e.message || 'Error al crear la cabaña')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-hero text-white bg-black/50">
      <div className="min-h-[100svh] px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 shadow-2xl p-6 md:p-8">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-6">
            <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">
              Crear nueva cabaña
            </span>
          </h2>
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50 mb-8" />

          {error && (
            <div className="mb-6 rounded-2xl bg-red-500/10 ring-1 ring-red-500/30 text-red-200 px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Nombre <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={hutData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Descripción <span className="text-red-400">*</span></label>
                  <textarea
                    name="description"
                    value={hutData.description}
                    onChange={handleChange}
                    rows="4"
                    required
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">URL de la imagen <span className="text-red-400">*</span></label>
                  <input
                    type="url"
                    name="image_url"
                    value={hutData.image_url}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Capacidad <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      value={hutData.capacity}
                      onChange={handleNumberChange}
                      required
                      className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Dormitorios <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      name="bedrooms"
                      min="1"
                      value={hutData.bedrooms}
                      onChange={handleNumberChange}
                      required
                      className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Baños <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      name="bathroom"
                      min="1"
                      value={hutData.bathroom}
                      onChange={handleNumberChange}
                      required
                      className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Precio por noche <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-500">€</span>
                    <input
                      type="number"
                      name="price_per_night"
                      min="1"
                      step="0.01"
                      value={hutData.price_per_night}
                      onChange={handleNumberChange}
                      required
                      className="w-full p-3 pl-8 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Ubicación ID <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    name="location_id"
                    min="1"
                    value={hutData.location_id}
                    onChange={handleNumberChange}
                    required
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                  />
                </div>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={hutData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-white/30 bg-white/90 text-green-450 focus:ring-green-350"
                  />
                  <span className="text-white/90 text-sm">Cabaña activa</span>
                </label>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
              <h3 className="text-lg font-semibold mb-4">Álbum de fotos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2">Dormitorio</label>
                  <input
                    type="url"
                    name="bedroom"
                    value={albumUrls.bedroom}
                    onChange={handleAlbumChange}
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Baño</label>
                  <input
                    type="url"
                    name="bathroom"
                    value={albumUrls.bathroom}
                    onChange={handleAlbumChange}
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Salón</label>
                  <input
                    type="url"
                    name="living_room"
                    value={albumUrls.living_room}
                    onChange={handleAlbumChange}
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Cocina</label>
                  <input
                    type="url"
                    name="kitchen"
                    value={albumUrls.kitchen}
                    onChange={handleAlbumChange}
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Otras</label>
                  <input
                    type="url"
                    name="other_picture"
                    value={albumUrls.other_picture}
                    onChange={handleAlbumChange}
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/huts')}
                className="rounded-3xl border border-brown-250 bg-gradient-to-br from-brown-250 to-green-250 px-6 py-3 text-white hover:scale-[1.02] transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`rounded-3xl border border-brown-250 bg-gradient-to-br from-brown-550 to-green-450 px-6 py-3 text-white hover:scale-[1.02] transition ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </span>
                ) : 'Crear Cabaña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default HutForm