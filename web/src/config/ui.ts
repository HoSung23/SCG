import type { TabId } from '../views/types'

export const tabLabelMap: Record<TabId, string> = {
  dashboard: 'Dashboard',
  combustible: 'Combustible',
  viajes: 'Viajes',
  costos: 'Costos',
  mantenimiento: 'Mantenimiento',
  flota: 'Flota',
  pilotos: 'Pilotos',
  roles: 'Roles',
  mobile: 'Mobile',
  desktop: 'Desktop',
  infraestructura: 'Infraestructura',
  reportes: 'Reportes'
}

export const roleModules: Record<string, string[]> = {
  Superadmin: ['Dashboard', 'Costos', 'Viajes', 'Mantenimiento', 'Usuarios', 'Configuración'],
  Admin: ['Dashboard', 'Costos', 'Viajes', 'Mantenimiento', 'Reportes'],
  Gerente: ['Dashboard', 'Reportes', 'Costos (lectura)'],
  Piloto: ['Iniciar viaje', 'Finalizar viaje', 'Incidencias', 'Modo offline'],
  Contador: ['Planilla', 'Costos', 'Exportación']
}
