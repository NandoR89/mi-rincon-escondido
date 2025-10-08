import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createHut } from '../services/hut'
import { addHutAlbumUrls } from '../services/hutsAlbums'
import useGlobalReducer from '../hooks/useGlobalReducer'
// ==================== IMPORTAR EL SERVICIO DE LOCATION ====================
import { createLocation } from '../services/location'

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
    location_id: null,
    image_url: '',
    is_active: true,
    // location_to: { lat: null, lng: null },
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

  // ==================== NUEVO ESTADO PARA LA UBICACIÓN ====================
  const [location, setLocation] = useState({
    address: "",
    city: "",
    complex: "",
    latitude: null,
    longitude: null,
    region: ""
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

  // ==================== MANEJADOR DE CAMBIOS PARA LA UBICACIÓN ====================
  const handleLocationChange = event => {
    const { name, value } = event.target
    setLocation(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? (value === '' ? null : parseFloat(value)) : value
    }))
  }

  // ==================== MANEJADOR DE SUBMIT ACTUALIZADO ====================
  const handleSubmit = async event => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

  try {
    let finalLocationId = null;

    // ==================== PRIMERO CREAMOS LA UBICACIÓN SI HAY DATOS ====================
    const hasLocationData = location.address && location.city && location.region && location.latitude && location.longitude;
    
    if (hasLocationData) {
      console.log('📍 Creando nueva ubicación...', location);
      const locationResponse = await createLocation(location);
      console.log('📍 Respuesta completa de createLocation:', locationResponse);
      
      // ==================== CORREGIDO: EL ID ESTÁ EN RESULTS ====================
      finalLocationId = locationResponse.results?.id;
      
      console.log('✅ Ubicación creada con ID:', finalLocationId);
      
      if (!finalLocationId) {
        throw new Error('No se pudo obtener el ID de la ubicación creada');
      }
    } else {
      // Si no hay datos de ubicación, usar el location_id del formulario
      finalLocationId = hutData.location_id;
      console.log('ℹ️ Usando location_id del formulario:', finalLocationId);
    }

    // ==================== VERIFICAR QUE TENEMOS UN location_id VÁLIDO ====================
    if (!finalLocationId) {
      throw new Error('Debe proporcionar una ubicación: complete los campos de ubicación');
    }

    // ==================== CREAR LA CABAÑA ====================
    const hutDataToSend = {
      name: hutData.name,
      description: hutData.description,
      capacity: Number(hutData.capacity),
      bedrooms: Number(hutData.bedrooms),
      bathroom: Number(hutData.bathroom),
      price_per_night: Number(hutData.price_per_night),
      location_id: Number(finalLocationId),
      image_url: hutData.image_url,
      is_active: Boolean(hutData.is_active)
    };
      console.log('📤 Enviando datos:', hutDataToSend); // Para debug

      const created = await createHut(hutDataToSend)
      const createdHut = created.results || created.hut || created
      const hutId = createdHut?.id
      if (!hutId) throw new Error('No se pudo obtener el ID de la cabaña creada')

      // ==================== AGREGAR FOTOS AL ÁLBUM ====================
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

                {/* <div>
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
                </div> */}

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

            {/* ==================== NUEVA SECCIÓN PARA LA UBICACIÓN ==================== */}
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
              <h3 className="text-lg font-semibold mb-4">Información de Ubicación (Opcional)</h3>
              <p className="text-sm text-white/70 mb-4">Complete estos campos para crear una nueva ubicación, o use el Location ID existente arriba.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Dirección</label>
                  <input
                    type="text"
                    name="address"
                    value={location.address}
                    onChange={handleLocationChange}
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                    placeholder="Ej: Calle Principal 123"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Ciudad</label>
                  <input
                    type="text"
                    name="city"
                    value={location.city}
                    onChange={handleLocationChange}
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                    placeholder="Ej: Bilbao"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Región</label>
                  <input
                    type="text"
                    name="region"
                    value={location.region}
                    onChange={handleLocationChange}
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                    placeholder="Ej: País Vasco"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Complejo/Urbanización</label>
                  <input
                    type="text"
                    name="complex"
                    value={location.complex}
                    onChange={handleLocationChange}
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                    placeholder="Ej: Fiopans"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Latitud</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={location.latitude || ''}
                    onChange={handleLocationChange}
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                    placeholder="Ej: 43.292939"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Longitud</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={location.longitude || ''}
                    onChange={handleLocationChange}
                    className="w-full p-3 rounded-lg border border-white/20 bg-white/90 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-350"
                    placeholder="Ej: -2.711772"
                  />
                </div>
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