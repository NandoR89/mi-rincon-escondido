// src/components/EditProfile.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useGlobalReducer from '../hooks/useGlobalReducer'
import { toast } from 'react-toastify'
import { updateUser, uploadAvatar } from '../services/profile'

export const EditProfile = () => {
  const { store, dispatch } = useGlobalReducer()
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const [imagePreview, setImagePreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    profile_image: ''
  })

  useEffect(() => {
    if (store.currentUser) {
      setFormData({
        first_name: store.currentUser.first_name || '',
        last_name: store.currentUser.last_name || '',
        email: store.currentUser.email || '',
        phone_number: store.currentUser.phone_number || '',
        address: store.currentUser.address || '',
        profile_image: store.currentUser.profile_image || ''
      })
      setImagePreview(
        store.currentUser.profile_image ||
          'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'
      )
    }
  }, [store.currentUser])

  const handleImageUpload = e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.match('image.*')) {
      toast.warning('Por favor, selecciona un archivo de imagen', { position: 'top-center', autoClose: 3000, theme: 'colored' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('La imagen es demasiado grande (máximo 5MB)', { position: 'top-center', autoClose: 3000, theme: 'colored' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
    setPendingAvatarFile(file)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsUploading(true)
    try {
      let payload = { ...formData }
      if (pendingAvatarFile) {
        const data = await uploadAvatar(store.currentUser.id, pendingAvatarFile)
        payload.profile_image = data.url || payload.profile_image
      }
      const updated = await updateUser(store.currentUser.id, payload)
      const updatedUser = updated.results || updated.user || updated
      dispatch({ type: 'currentUser', payload: updatedUser })
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage
      storage.setItem('currentUser', JSON.stringify(updatedUser))
      toast.success('¡Perfil actualizado correctamente!', { position: 'top-center', autoClose: 3000, theme: 'colored' })
      navigate(`/profile/${updatedUser.id}`)
    } catch (error) {
      alert(error.message || 'Error al actualizar el perfil')
    } finally {
      setIsUploading(false)
      setPendingAvatarFile(null)
    }
  }

  const handleReturnProfile = () => navigate(-1)

  return (
    <div className="bg-hero text-white bg-black/50">
      <div className="min-h-[100svh] flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 shadow-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-center text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">Editar Perfil</span>
          </h2>

          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Foto de perfil"
                className="h-32 w-32 md:h-36 md:w-36 rounded-full border-4 border-white object-cover cursor-pointer hover:opacity-90 transition"
                onClick={() => fileInputRef.current?.click()}
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 rounded-full bg-gradient-to-br from-brown-550 to-green-450 border border-brown-250 px-4 py-2 text-sm hover:scale-[1.02] transition"
            >
              Cambiar foto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Nombre</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full border bg-stone-300/10 px-4 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-350"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-2">Apellidos</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full border bg-stone-300/10 px-4 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-350"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full border bg-stone-300/10 px-4 py-3 rounded-lg text-lg disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-350"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Teléfono</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full border bg-stone-300/10 px-4 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-350"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Dirección</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full border bg-stone-300/10 px-4 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-350"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
            <button
              onClick={handleReturnProfile}
              type="button"
              className="w-full sm:w-1/3 bg-gradient-to-br from-brown-250 to-green-250 rounded-3xl border border-brown-250 text-center p-3 hover:scale-[1.02] text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`w-full sm:w-1/3 bg-gradient-to-br from-brown-550 to-green-450 rounded-3xl border border-brown-250 text-center p-3 hover:scale-[1.02] text-white transition ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}