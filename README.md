# SCG — Sistema de Control de Gastos (Transporte Pesado)

Base inicial del proyecto separada por plataformas desde el inicio:

- `web` (React + Vite + TypeScript)
- `mobile` (React Native + Expo)
- `electron` (Desktop shell)

El enfoque actual es **demo local con mock data**, y luego conectar Supabase.

## Estado actual (MVP base)

Implementado:

- Monorepo con workspaces npm
- Dashboard web de demo cliente con:
  - KPIs (viajes activos, camiones activos, costo mensual, riesgo conectividad)
  - Costos por categoría
  - Viajes recientes + trazabilidad de ruta
  - Alertas operativas
  - Mantenimiento programado
  - Pilotos y camiones (asignación base)
  - Matriz de roles y permisos
  - Radar de combustible con regla de precio máximo
- App móvil base (pantalla inicial + flujo piloto planteado)
- App desktop base en Electron cargando `http://localhost:5173`

### Cobertura de módulos en la demo

- Dashboard Principal: **base**
- Combustible: **base**
- Mantenimiento y Reparaciones: **base**
- Costos Generales: **base**
- Viajes: **base**
- Pilotos y Camiones: **base**
- Permisos y Roles: **base**
- App Móvil para Pilotos: **en progreso**
- App Desktop: **en progreso**

Pendiente inmediato:

- Conectar datos reales en Supabase
- Sincronización offline/online para pilotos
- Migración de históricos desde Excel
- Tracking en vivo y mantenimiento preventivo

## Decisiones confirmadas

- Flota actual: 25 camiones (escalable a más)
- Pilotos con Android y iPhone
- Hay históricos en Excel que deben migrarse
- FEL no es prioridad en Fase 1
- Gasolineras principales: Shell, UNO, Puma
- Se requiere plan de contingencia por conectividad intermitente

## Estructura

```text
SCG/
  package.json
  README.md
  web/
    package.json
    index.html
    tsconfig.json
    vite.config.ts
    src/
      App.tsx
      main.tsx
      mockData.ts
      styles.css
      types.ts
  mobile/
    package.json
    app.json
    index.js
    src/
      App.js
  electron/
    package.json
    main.js
```

## Requisitos

- Node.js 20+
- npm 10+

## Instalación

Desde la carpeta `SCG`:

```powershell
cd c:\Users\yoshi\Desktop\SCG
npm install
```

## Ejecución (desarrollo)

### Web

```powershell
cd c:\Users\yoshi\Desktop\SCG
npm run dev:web
```

### Mobile (Expo)

```powershell
cd c:\Users\yoshi\Desktop\SCG
npm run dev:mobile
```

### Desktop (Electron)

1) En una terminal deja corriendo la web.

```powershell
cd c:\Users\yoshi\Desktop\SCG
npm run dev:web
```

2) En otra terminal ejecuta Electron.

```powershell
cd c:\Users\yoshi\Desktop\SCG
npm run dev:electron
```

## Build web

```powershell
cd c:\Users\yoshi\Desktop\SCG
npm run build:web
```

## Guion de presentación (10 min)

1. **Contexto (1 min)**
  - Problema: control de costos y operación de flota en un solo sistema.
2. **Dashboard (2 min)**
  - KPIs: viajes activos, camiones activos, costo mensual y riesgo de conectividad.
3. **Combustible y costos (2 min)**
  - Regla del precio máximo para estimación conservadora del gasto.
4. **Operación de viajes (2 min)**
  - Estados de viaje, alertas operativas y trazabilidad de ruta.
5. **Mantenimiento y contingencia (2 min)**
  - Cola de mantenimientos y plan offline para rutas sin señal.
6. **Cierre (1 min)**
  - Próximo paso: conexión a Supabase y migración de históricos desde Excel.

## Roadmap corto

### Fase 1 (actual)

- Demo local completa con mock data
- Separación `web` + `mobile` + `electron`
- Vista ejecutiva para validación con cliente

### Fase 1.1

- Supabase (auth + RLS + tablas core)
- Importador inicial de Excel

### Fase 1.2

- Sincronización offline/online robusta
- Tracking en vivo de rutas y eventos

### Fase 2

- Reportes exportables
- Alertas por WhatsApp/SMS
- Rentabilidad por ruta y geofencing