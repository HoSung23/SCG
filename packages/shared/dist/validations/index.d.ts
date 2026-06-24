import { z } from 'zod';
export declare const userRoleSchema: z.ZodEnum<["superadmin", "admin", "gerente", "contador", "piloto"]>;
export declare const truckStatusSchema: z.ZodEnum<["activo", "mantenimiento", "inactivo"]>;
export declare const tripStatusSchema: z.ZodEnum<["programado", "en_ruta", "completado", "cancelado"]>;
export declare const truckSchema: z.ZodObject<{
    plate: z.ZodString;
    brand: z.ZodString;
    model: z.ZodString;
    year: z.ZodNumber;
    capacityTons: z.ZodNumber;
    fuelEfficiency: z.ZodNumber;
    status: z.ZodEnum<["activo", "mantenimiento", "inactivo"]>;
    mileage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    plate: string;
    brand: string;
    model: string;
    year: number;
    capacityTons: number;
    fuelEfficiency: number;
    status: "activo" | "mantenimiento" | "inactivo";
    mileage: number;
}, {
    plate: string;
    brand: string;
    model: string;
    year: number;
    capacityTons: number;
    fuelEfficiency: number;
    status: "activo" | "mantenimiento" | "inactivo";
    mileage: number;
}>;
export declare const tripSchema: z.ZodObject<{
    truckId: z.ZodString;
    driverId: z.ZodString;
    origin: z.ZodString;
    destination: z.ZodString;
    status: z.ZodEnum<["programado", "en_ruta", "completado", "cancelado"]>;
}, "strip", z.ZodTypeAny, {
    status: "programado" | "en_ruta" | "completado" | "cancelado";
    truckId: string;
    driverId: string;
    origin: string;
    destination: string;
}, {
    status: "programado" | "en_ruta" | "completado" | "cancelado";
    truckId: string;
    driverId: string;
    origin: string;
    destination: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
//# sourceMappingURL=index.d.ts.map