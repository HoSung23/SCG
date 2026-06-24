// Datos de ejemplo para pruebas en desarrollo
// En producción, estos vienen de Supabase

export const MOCK_PILOT = {
  id: 'pilot-1',
  user_id: 'user-1',
  name: 'Juan Pérez',
  phone: '+502-1234-5678',
  license_number: 'LIC-001',
  status: 'active'
}

export const MOCK_TRIPS = [
  {
    id: 'trip-1',
    assigned_pilot_id: 'pilot-1',
    origin: 'Guatemala City',
    destination: 'Puerto Barrios',
    distance: 285,
    cargo_type: 'Electrodomésticos',
    notes: 'Entregas a 3 puntos diferentes',
    status: 'assigned',
    created_at: '2026-06-24T08:00:00Z',
    start_location: null,
    start_latitude: null,
    start_longitude: null,
    end_location: null,
    end_latitude: null,
    end_longitude: null,
    started_at: null,
    completed_at: null
  },
  {
    id: 'trip-2',
    assigned_pilot_id: 'pilot-1',
    origin: 'Antigua',
    destination: 'Escuintla',
    distance: 145,
    cargo_type: 'Frutas y vegetales',
    notes: 'Carga frágil - refrigerado',
    status: 'pending',
    created_at: '2026-06-24T09:30:00Z',
    start_location: null,
    start_latitude: null,
    start_longitude: null,
    end_location: null,
    end_latitude: null,
    end_longitude: null,
    started_at: null,
    completed_at: null
  },
  {
    id: 'trip-3',
    assigned_pilot_id: 'pilot-1',
    origin: 'Zona 10, Guatemala',
    destination: 'Sacatepéquez',
    distance: 45,
    cargo_type: 'Documentos y paquetería',
    notes: null,
    status: 'assigned',
    created_at: '2026-06-24T10:00:00Z',
    start_location: null,
    start_latitude: null,
    start_longitude: null,
    end_location: null,
    end_latitude: null,
    end_longitude: null,
    started_at: null,
    completed_at: null
  }
]

export const TEST_CREDENTIALS = {
  email: 'pilot1@example.com',
  password: 'password123'
}

// Ubicaciones de prueba (coordenadas reales de Guatemala)
export const TEST_LOCATIONS = {
  guatemalaCity: {
    latitude: 14.6349,
    longitude: -90.5069
  },
  puertoBarios: {
    latitude: 15.7282,
    longitude: -88.5853
  },
  antigua: {
    latitude: 14.5767,
    longitude: -90.7291
  },
  escuintla: {
    latitude: 14.3075,
    longitude: -91.1958
  }
}
