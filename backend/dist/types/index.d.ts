export interface Truck {
    id: string;
    plate: string;
    model: string;
    year: number;
    fuelKmPerGallon: number;
    status: 'active' | 'maintenance' | 'idle' | 'retired';
    ownershipType: 'propia' | 'arrendada';
    gpsDeviceId?: string;
    lastGpsUpdate?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Pilot {
    id: string;
    name: string;
    licenseType: 'C' | 'D';
    licenseNumber: string;
    licenseDue: string;
    licenseStatus: 'valid' | 'expired' | 'about_to_expire';
    assignedTruckId?: string;
    status: 'active' | 'inactive' | 'on_leave';
    phoneNumber?: string;
    email?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Trip {
    id: string;
    truckId: string;
    pilotId: string;
    origin: string;
    destination: string;
    distanceKm: number;
    estimatedTimeHours: number;
    status: 'programado' | 'en-ruta' | 'completado' | 'cancelado';
    startedAt?: string;
    completedAt?: string;
    fuelConsumptionGallons?: number;
    costGtq?: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
export interface MaintenanceTask {
    id: string;
    truckId: string;
    type: 'preventivo' | 'correctivo' | 'emergencia';
    description: string;
    dueInKm?: number;
    currentKm?: number;
    status: 'programado' | 'en-progreso' | 'completado' | 'cancelado';
    estimatedCostGtq?: number;
    actualCostGtq?: number;
    scheduledDate?: string;
    completedDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
export interface FuelRecord {
    id: string;
    truckId: string;
    station: string;
    dieselPriceGtq: number;
    gallonsDispensed: number;
    totalCostGtq: number;
    meterKm?: number;
    recordedAt: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
export interface CostRecord {
    id: string;
    category: 'combustible' | 'mantenimiento' | 'salarios' | 'seguros' | 'tolls' | 'otro';
    description: string;
    amountGtq: number;
    relatedTruckId?: string;
    relatedPilotId?: string;
    recordedAt: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
export interface AlertItem {
    id: string;
    level: 'critical' | 'warning' | 'info';
    title: string;
    detail: string;
    relatedTruckId?: string;
    relatedPilotId?: string;
    relatedTripId?: string;
    resolved: boolean;
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'superadmin' | 'admin' | 'gerente' | 'piloto' | 'contador';
    companyId: string;
    status: 'active' | 'inactive';
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface UserRole {
    id: string;
    name: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=index.d.ts.map