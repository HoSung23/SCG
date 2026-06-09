const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

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
}

export const apiClient = new ApiClient()
