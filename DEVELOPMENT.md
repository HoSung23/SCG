# SCG — Sistema de Control de Gastos
## Development Guide - Backend + Supabase Integration

> Este es el documento para **iniciar el desarrollo real** del app después del MVP demo local.

## 🎯 Objetivo

Construir una plataforma completa para gestionar la operación de una flota de 25 camiones con:
- Backend REST API (Node.js + Express)
- Supabase como base de datos (PostgreSQL)
- Frontend React conectado a datos reales
- Sincronización offline para pilotos
- Tracking GPS en vivo

## 🏗️ Arquitectura Actual

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│              http://localhost:5173                   │
│          - Web app con 11 módulos operacionales     │
│          - API client conectado a backend           │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ fetch() calls
                   ▼
┌─────────────────────────────────────────────────────┐
│              Backend API (Node.js)                   │
│              http://localhost:3000/api               │
│          - 6 route groups (trucks, pilots, etc)     │
│          - Controllers con lógica de negocio         │
│          - Supabase client integrado                │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ supabaseClient.from()
                   ▼
┌─────────────────────────────────────────────────────┐
│            Supabase PostgreSQL Database              │
│       8 tablas: trucks, pilots, trips, etc.         │
│              https://supabase.com                    │
└─────────────────────────────────────────────────────┘
```

## 📋 Checklist de Setup

### ✅ Completado
- [x] Backend scaffold (Express + TypeScript)
- [x] API routes (6 grupos: trucks, pilots, trips, maintenance, fuel, costs)
- [x] Controllers base para CRUD
- [x] Supabase client configurado
- [x] Database type definitions (TypeScript)
- [x] Seed script preparado
- [x] Frontend API client
- [x] npm workspaces configurados

### ⏳ Próximos pasos

1. **[ ] Crear proyecto Supabase** (5 min)
2. **[ ] Configurar .env en backend** (2 min)
3. **[ ] Crear tablas SQL** (5 min)
4. **[ ] Seedear datos iniciales** (5 min)
5. **[ ] Probar conexión backend → Supabase** (5 min)
6. **[ ] Iniciar dev servers** (web + backend) (5 min)
7. **[ ] Verificar que frontend consume datos reales** (10 min)

## 🚀 Quick Start

### Paso 1: Crear proyecto en Supabase

1. Ve a https://supabase.com
2. Sign up / Log in
3. Click "New project"
4. Nombre: `scg-demo`
5. Copia tus credenciales:
   - **SUPABASE_URL**: `https://your-project.supabase.co`
   - **SUPABASE_KEY**: (Anon key)
   - **SUPABASE_SERVICE_ROLE_KEY**: (Service role key)

### Paso 2: Configurar backend

```powershell
# Copiar .env.example
cd c:\Users\yoshi\Desktop\SCG\backend
Copy-Item .env.example .env

# Editar .env con tus credenciales Supabase
# (Usa Notepad o VS Code)
```

Contenido de `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
PORT=3000
NODE_ENV=development
```

### Paso 3: Crear tablas SQL

1. Ve a Supabase → SQL Editor
2. Copia y ejecuta el SQL de `backend/SETUP.md` (sección "Crear tablas en Supabase")
3. Verifica que se crearon 8 tablas

### Paso 4: Seedear datos

```powershell
# Terminal 1: Seedear base de datos
cd c:\Users\yoshi\Desktop\SCG
npm run seed --workspace backend
# → Debería mostrar: "✅ Database seeding completed successfully!"
```

### Paso 5: Iniciar dev servers

```powershell
# Terminal 1: Backend
cd c:\Users\yoshi\Desktop\SCG
npm run dev:backend
# → ✓ Server running on http://localhost:3000

# Terminal 2: Frontend
cd c:\Users\yoshi\Desktop\SCG
npm run dev:web
# → ✓ Local: http://localhost:5173

# Terminal 3 (opcional): Electron
npm run dev:electron
```

### Paso 6: Probar

Abre http://localhost:5173 en el navegador.

Ve al módulo **Flota** y deberías ver:
- ✅ Lista de camiones desde Supabase
- ✅ Botones para cambiar estado
- ✅ Los cambios se guardan en BD

## 📚 Estructura de carpetas

```
SCG/
├── backend/                    # 🆕 Backend API
│   ├── src/
│   │   ├── index.ts           # Servidor Express
│   │   ├── migrations.ts       # Script de migraciones
│   │   ├── seed.ts            # Script de seed
│   │   ├── types/
│   │   │   └── index.ts       # TypeScript types
│   │   ├── utils/
│   │   │   ├── supabase.ts    # Cliente Supabase
│   │   │   └── database.ts    # Funciones CRUD
│   │   ├── controllers/        # Lógica de CRUD
│   │   │   ├── trucks.ts
│   │   │   ├── pilots.ts
│   │   │   ├── trips.ts
│   │   │   ├── maintenance.ts
│   │   │   ├── fuel.ts
│   │   │   └── costs.ts
│   │   ├── routes/            # Rutas API
│   │   │   ├── trucks.ts
│   │   │   ├── pilots.ts
│   │   │   ├── trips.ts
│   │   │   ├── maintenance.ts
│   │   │   ├── fuel.ts
│   │   │   └── costs.ts
│   │   └── middleware/        # Auth, logging, etc
│   ├── .env.example           # Credenciales template
│   ├── package.json
│   ├── tsconfig.json
│   ├── SETUP.md              # Guía de configuración
│   └── dist/                 # Build output
│
├── web/                       # Frontend React
│   ├── src/
│   │   ├── App.tsx           # Componente principal
│   │   ├── mockData.ts       # Demo data (legacy)
│   │   ├── services/
│   │   │   └── api.ts        # 🆕 Cliente API real
│   │   ├── types.ts          # TypeScript types
│   │   └── styles.css        # Estilos
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── dist/
│
├── mobile/                    # React Native (future)
├── electron/                  # Desktop app
└── package.json              # Root workspace
```

## 🔌 API Endpoints

### Camiones
```
GET    /api/trucks              → Listar todos
POST   /api/trucks              → Crear
GET    /api/trucks/:id          → Obtener uno
PUT    /api/trucks/:id          → Actualizar
DELETE /api/trucks/:id          → Marcar retired
```

### Pilotos
```
GET    /api/pilots              → Listar
POST   /api/pilots              → Crear
PUT    /api/pilots/:id          → Actualizar
POST   /api/pilots/:id/assign-truck → Asignar camión
```

### Viajes
```
GET    /api/trips               → Listar
POST   /api/trips               → Crear
PUT    /api/trips/:id/status    → Cambiar estado
```

### Mantenimiento
```
GET    /api/maintenance         → Listar
POST   /api/maintenance         → Crear tarea
PUT    /api/maintenance/:id/complete → Marcar completado
```

### Combustible
```
GET    /api/fuel                → Listar registros
POST   /api/fuel                → Registrar carga
```

### Costos
```
GET    /api/costs               → Listar
GET    /api/costs/summary/by-category → Por categoría
POST   /api/costs               → Registrar costo
```

## 🧪 Testing

### Test en Postman/Insomnia

Crear trip:
```
POST http://localhost:3000/api/trips

{
  "truckId": "truck-uuid",
  "pilotId": "pilot-uuid",
  "origin": "Guatemala City",
  "destination": "Puerto San José",
  "distanceKm": 145,
  "estimatedTimeHours": 2
}
```

### Test desde Frontend

El App.tsx ya tiene los handlers listos:
- Click en "Iniciar viaje" → PATCH /api/trips/:id/status
- Cambiar precio combustible → POST /api/fuel
- Registrar costo → POST /api/costs

Todos guardarán en Supabase automáticamente.

## 📦 Tecnologías

| Capa | Tech | Versión |
|------|------|---------|
| **Backend** | Node.js | 20+ |
| | Express | 4.18 |
| | TypeScript | 5.3 |
| | Supabase JS | 2.43 |
| **Frontend** | React | 18+ |
| | Vite | 5.4 |
| | TypeScript | 5.3 |
| **Database** | PostgreSQL | Supabase |
| **Hosting** | TBD | (Vercel, Render, etc) |

## 🔒 Seguridad

**Fase 1** (actual): Sin autenticación
- API abierto (útil para desarrollo)
- Base de datos con RLS deshabilitado

**Fase 2** (próximo): Agregar autenticación
- Supabase Auth (login/registro)
- JWT tokens
- RLS policies por rol
- Rate limiting

## 📝 Próximos sprints

### Sprint 1: Conectar datos (esta semana)
- [ ] Supabase setup completo
- [ ] Backend devolviendo datos reales
- [ ] Frontend consumiendo API
- [ ] Seedear 25 camiones, 25 pilotos, 50 viajes

### Sprint 2: Autenticación (próxima semana)
- [ ] Supabase Auth (JWT)
- [ ] Login/registro en frontend
- [ ] Proteger rutas sensibles (solo gerente → costos)
- [ ] Sesiones persistentes

### Sprint 3: Sincronización offline (2 semanas)
- [ ] Queue local en React para cambios offline
- [ ] Sync automático cuando se restaura conexión
- [ ] Indicador de sync status

### Sprint 4: GPS tracking (3 semanas)
- [ ] Webhook para recibir ubicaciones
- [ ] Mapa en tiempo real
- [ ] Alertas de desvío

### Sprint 5: Reportes & Export (4 semanas)
- [ ] Generar PDF con históricos
- [ ] Export a Excel
- [ ] Gráficos de costos/combustible

## ❓ Troubleshooting

### "Cannot connect to Supabase"
- Verifica que .env esté en `SCG/backend/`
- Confirma SUPABASE_URL y SUPABASE_KEY
- Prueba con: `npm run dev:backend` — debería loguear "✓ Supabase connection successful"

### "Port 3000 already in use"
- Cambia PORT en .env a 3001
- Luego actualiza .env del web: `VITE_API_URL=http://localhost:3001/api`

### "Frontend no ve datos"
- Abre DevTools → Network
- Ve a http://localhost:3000/api/trucks
- Debería retornar JSON con camiones
- Si 404, verifica que backend está corriendo en puerto 3000

### "Migrations failed"
- No es crítico en Fase 1
- Crear tablas manualmente en Supabase SQL Editor

## 📞 Contacto & Documentación

- **Supabase Docs**: https://supabase.com/docs
- **Express Guide**: https://expressjs.com/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Vite Guide**: https://vitejs.dev/guide/

---

**Status**: 🟡 In Development  
**Last Updated**: June 2026  
**Version**: 0.1.0
