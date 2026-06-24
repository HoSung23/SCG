import * as Location from 'expo-location'

/**
 * Solicita permiso de ubicación y devuelve las coordenadas actuales
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export const getLocationWithPermission = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync()
    
    if (status !== 'granted') {
      console.warn('Permiso de ubicación denegado')
      return null
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    })

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    }
  } catch (error) {
    console.error('Error al obtener ubicación:', error)
    return null
  }
}

/**
 * Formatea una coordenada GPS para guardarse en BD
 * @param {number} latitude
 * @param {number} longitude
 * @returns {string}
 */
export const formatLocationString = (latitude, longitude) => {
  return `${latitude},${longitude}`
}

/**
 * Calcula distancia entre dos puntos GPS usando fórmula Haversine
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distancia en kilómetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Valida si un email es válido
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Formatea una fecha para mostrar en español
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formatea fecha y hora
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  const d = new Date(date)
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
