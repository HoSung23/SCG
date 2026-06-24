# 📱 SCG Mobile - Arquitectura y Flujo

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                   App Principal                      │
│                    (App.js)                          │
│   - Gestiona estado de autenticación                │
│   - Control de navegación                           │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼────┐          ┌────▼──────┐
    │ LOGIN  │          │   TRIPS   │
    │SCREEN  │          │  SCREEN   │
    └────────┘          └──────┬────┘
                               │
                        ┌──────▼────────┐
                        │ START TRIP    │
                        │ MODAL        │
                        └───────────────┘
```

## 🔄 Flujo de Usuario

```
1. INICIO
   ↓
2. ¿Usuario autenticado? NO → LOGIN
   ├─ Ingresa email
   ├─ Ingresa password
   ├─ Valida credenciales en Supabase
   └─ Verifica que sea piloto
   
3. SÍ → LISTA DE VIAJES
   ├─ Carga viajes asignados/pendientes
   ├─ Muestra como tarjetas
   └─ Permite seleccionar viaje
   
4. MODAL DE CONFIRMACIÓN
   ├─ Muestra datos del viaje
   ├─ Advierte sobre GPS
   └─ Opciones: Cancelar / Iniciar
   
5. INICIAR VIAJE
   ├─ Solicita permiso de GPS
   ├─ Captura coordenadas actuales
   ├─ Sube a Supabase
   ├─ Cambia estado a "in_progress"
   └─ Notifica éxito/error
```

## 📊 Estructura de Base de Datos

### Tabla: pilots
```
id (UUID)              → Identificador único
user_id (UUID)         → Referencia a usuario autenticado
name (TEXT)            → Nombre del piloto
phone (TEXT)           → Teléfono de contacto
license_number (TEXT)  → Número de licencia
status (TEXT)          → active/inactive
created_at (TIMESTAMP) → Fecha de creación
updated_at (TIMESTAMP) → Última actualización
```

### Tabla: trips
```
id (UUID)                 → Identificador único
assigned_pilot_id (UUID)  → Referencia al piloto
origin (TEXT)             → Punto de salida
destination (TEXT)        → Punto de llegada
distance (INTEGER)        → Km a recorrer
cargo_type (TEXT)         → Tipo de carga
notes (TEXT)              → Notas adicionales
status (TEXT)             → pending/assigned/in_progress/completed
start_location (TEXT)     → Formato: "lat,lon"
start_latitude (FLOAT)    → Latitud de inicio
start_longitude (FLOAT)   → Longitud de inicio
end_location (TEXT)       → Formato: "lat,lon"
end_latitude (FLOAT)      → Latitud de finalización
end_longitude (FLOAT)     → Longitud de finalización
started_at (TIMESTAMP)    → Cuándo inició
completed_at (TIMESTAMP)  → Cuándo finalizó
created_at (TIMESTAMP)    → Creación
updated_at (TIMESTAMP)    → Última actualización
```

## 🔐 Seguridad - Row Level Security (RLS)

```
Tabla: pilots
├─ SELECT: Los pilotos ven solo SUS propios datos (user_id = auth.uid())
└─ UPDATE: No pueden actualizar (admin only)

Tabla: trips
├─ SELECT: Los pilotos ven solo SUS viajes asignados
├─ UPDATE: Los pilotos pueden actualizar solo sus viajes
└─ INSERT/DELETE: Admin only
```

## 📁 Estructura de Archivos

```
mobile/
├── app.json                    # Configuración Expo
├── package.json               # Dependencias
├── index.js                   # Entrada de app
├── README.md                  # Documentación general
├── SETUP.md                   # Guía de instalación
├── .env.example              # Variables de entorno (ej)
└── src/
    ├── App.js                # App principal (navegación)
    ├── supabaseClient.js     # Cliente de Supabase
    ├── screens/
    │   ├── LoginScreen.js    # 📱 Pantalla de login
    │   │   ├─ Inputs: email, password
    │   │   ├─ Validaciones
    │   │   └─ Integracion: Supabase Auth
    │   │
    │   └── TripsScreen.js    # 📱 Pantalla de viajes
    │       ├─ Lista de tarjetas
    │       ├─ Carga desde DB
    │       └─ Manejo de modal
    │
    ├── components/
    │   └── StartTripModal.js # 🎨 Modal de confirmación
    │       ├─ Muestra detalles
    │       ├─ Botones Cancelar/Iniciar
    │       └─ Captura de GPS
    │
    ├── utils/
    │   └── helpers.js        # 🛠️ Utilidades
    │       ├─ getLocationWithPermission()
    │       ├─ calculateDistance()
    │       ├─ formatDate()
    │       └─ validateEmail()
    │
    └── constants/
        └── mockData.js       # 📊 Datos de prueba
            ├─ MOCK_PILOT
            ├─ MOCK_TRIPS
            └─ TEST_LOCATIONS
```

## 🔄 Flujo de Datos

```
┌─────────────────┐
│   Supabase      │ ← Almacenamiento principal
│   (BD + Auth)   │
└────────┬────────┘
         │
         │ Autenticación
         │ Lectura/Escritura de datos
         │
┌────────▼────────────────┐
│   supabaseClient.js     │ ← Cliente SDK
└────────┬────────────────┘
         │
    ┌────┴────┬──────────┐
    │          │          │
    │          │          │
┌───▼──┐  ┌───▼──┐  ┌───▼──────┐
│Login │  │Trips │  │  Modal   │
│      │  │      │  │  Ubicación│
└──────┘  └──────┘  └─────────┘
```

## 🎯 Estados de Viaje

```
pending
  │
  ├─ Sin asignar aún
  
assigned
  │
  ├─ Asignado al piloto
  ├─ Muestra en lista
  └─ Piloto puede iniciar
  
in_progress
  │
  ├─ Viaje iniciado
  ├─ GPS capturado
  ├─ No aparece en lista "disponibles"
  └─ Piloto viajando
  
completed
  │
  └─ Viaje finalizado
     (próxima feature)
```

## 🚀 Funcionalidades Implementadas

✅ Autenticación de pilotos (email/password)
✅ Visualización de viajes asignados
✅ Modal de confirmación
✅ Captura de ubicación GPS
✅ Sincronización con Supabase
✅ UI oscura responsive
✅ Manejo de permisos
✅ Validaciones

## 📋 Próximas Funcionalidades

⬜ Finalizar viaje con foto y ubicación
⬜ Reportar incidencias en ruta
⬜ Modo offline con sincronización
⬜ Historial de viajes completados
⬜ Chat con supervisor
⬜ Notificaciones push
⬜ Rastreo en vivo (maps)
⬜ Evidencia (fotos/videos)
