// services/location.js
export const createLocation = async (locationData) => {
  const host = import.meta.env.VITE_BACKEND_URL
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  
  console.log('📍 Enviando datos a location:', locationData);
  
  const response = await fetch(`${host}api/locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(locationData)
  })
  
  const data = await response.json()
  console.log('📍 Respuesta del backend location:', data);
  
  if (!response.ok) throw new Error(data.message || 'Error creando ubicación')
  return data
}