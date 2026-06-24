const API_ENV_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const normalizedEnvUrl = API_ENV_URL.replace(/\/$/, '')
const hasApiSuffix = /\/api$/i.test(normalizedEnvUrl)

export const API_BASE_URL = hasApiSuffix
  ? normalizedEnvUrl
  : `${normalizedEnvUrl}/api`

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Trucks
  async getTrucks() {
    return this.request('/trucks')
  }

  async getTruck(id: string) {
    return this.request(`/trucks/${id}`)
  }

  async createTruck(data: any) {
    return this.request('/trucks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTruck(id: string, data: any) {
    return this.request(`/trucks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Pilots
  async getPilots() {
    return this.request('/pilots')
  }

  async getPilot(id: string) {
    return this.request(`/pilots/${id}`)
  }

  async createPilot(data: any) {
    return this.request('/pilots', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePilot(id: string, data: any) {
    return this.request(`/pilots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async assignTruckToPilot(pilotId: string, truckId: string) {
    return this.request(`/pilots/${pilotId}/assign-truck`, {
      method: 'POST',
      body: JSON.stringify({ truckId }),
    })
  }

  // Trips
  async getTrips() {
    return this.request('/trips')
  }

  async getTrip(id: string) {
    return this.request(`/trips/${id}`)
  }

  async createTrip(data: any) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTripStatus(id: string, status: string) {
    return this.request(`/trips/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Maintenance
  async getMaintenanceTasks() {
    return this.request('/maintenance')
  }

  async createMaintenanceTask(data: any) {
    return this.request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async completeMaintenanceTask(id: string, data: any) {
    return this.request(`/maintenance/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Fuel
  async getFuelRecords() {
    return this.request('/fuel')
  }

  async getMemFuelPriceToday() {
    return this.request('/fuel-prices/today')
  }

  async recordFuel(data: any) {
    return this.request('/fuel', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Costs
  async getCostRecords() {
    return this.request('/costs')
  }

  async getCostsByCategory() {
    return this.request('/costs/summary/by-category')
  }

  async recordCost(data: any) {
    return this.request('/costs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Alerts
  async getAlerts() {
    return this.request('/alerts')
  }

  async createAlert(data: any) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async resolveAlert(id: string) {
    return this.request(`/alerts/${id}/resolve`, {
      method: 'PUT',
    })
  }

  // Clients
  async getClients() {
    return this.request('/clients')
  }

  async createClient(data: object) {
    return this.request('/clients', { method: 'POST', body: JSON.stringify(data) })
  }

  async updateClient(id: string, data: object) {
    return this.request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }

  async deleteClient(id: string) {
    return this.request(`/clients/${id}`, { method: 'DELETE' })
  }

  // Materials
  async getMaterials() {
    return this.request('/materials')
  }

  async createMaterial(data: object) {
    return this.request('/materials', { method: 'POST', body: JSON.stringify(data) })
  }

  async updateMaterial(id: string, data: object) {
    return this.request(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }

  async toggleMaterial(id: string) {
    return this.request(`/materials/${id}/toggle`, { method: 'POST' })
  }

  // Programacion
  async getProgramaciones(params?: { status?: string; fecha?: string }) {
    const qs = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString()
      : ''
    return this.request(`/programacion${qs}`)
  }

  async assignPilotToProgramacion(id: string, pilotId: string) {
    return this.request(`/programacion/${id}/assign-pilot`, { method: 'POST', body: JSON.stringify({ pilotId }) })
  }

  async assignTruckToProgramacion(id: string, truckId: string) {
    return this.request(`/programacion/${id}/assign-truck`, { method: 'POST', body: JSON.stringify({ truckId }) })
  }

  async generateTripFromProgramacion(id: string) {
    return this.request(`/programacion/${id}/generate-trip`, { method: 'POST' })
  }

  // Trips extended
  async startTrip(id: string, data: { gpsInicio?: string; odometroInicio?: number; observaciones?: string }) {
    return this.request(`/trips/${id}/start`, { method: 'POST', body: JSON.stringify(data) })
  }

  async finishTrip(id: string, data: { gpsFin?: string; odometroFin?: number; observaciones?: string; fuelConsumptionGallons?: number; costGtq?: number }) {
    return this.request(`/trips/${id}/finish`, { method: 'POST', body: JSON.stringify(data) })
  }

  async getAllTrips(params?: { status?: string; pilotId?: string; truckId?: string; clientId?: string; from?: string; to?: string }) {
    const qs = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString()
      : ''
    return this.request(`/trips${qs}`)
  }
}

export const apiClient = new ApiClient()
