export interface Client {
  id: string
  name: string
  nit?: string
  contactName?: string
  phone?: string
  email?: string
  address?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Material {
  id: string
  name: string
  unit: string
  description?: string
  active: boolean
  createdAt: string
  updatedAt: string
}
