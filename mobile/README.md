# SCG Mobile - App para Pilotos

App móvil React Native + Expo para que los pilotos gestionen sus viajes, captura de ubicación y sincronización con Supabase.

## Características

✅ **Autenticación de Pilotos**
- Login seguro con email/contraseña
- Validación que el usuario es piloto

✅ **Gestión de Viajes**
- Visualización de viajes asignados y pendientes
- Tarjetas con información de ruta, distancia y carga
- Filtro automático por estado (pending, assigned, in_progress)

✅ **Inicio de Viaje**
- Modal de confirmación con detalles del viaje
- Captura automática de ubicación GPS (latitud/longitud)
- Actualización del estado a "in_progress"
- Sincronización con Supabase

✅ **UI/UX Moderno**
- Tema oscuro consistente
- Navegación fluida con React Navigation
- Manejo de estados de carga y errores

## Setup

### 1. Instalar dependencias

```bash
cd mobile
npm install
# o
pnpm install
```

### 2. Configurar Supabase

Edita `src/supabaseClient.js` con tus credenciales:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_KEY = 'your-anon-key'
```

### 3. Estructura de BD (Supabase)

**Tabla: pilots**
```sql
id UUID PRIMARY KEY
user_id UUID (referencia a auth.users)
name TEXT
phone TEXT
license_number TEXT
status TEXT (active, inactive)
created_at TIMESTAMP
```

**Tabla: trips**
```sql
id UUID PRIMARY KEY
assigned_pilot_id UUID (referencia a pilots.id)
origin TEXT
destination TEXT
distance INTEGER (en km)
cargo_type TEXT
notes TEXT (opcional)
status TEXT (pending, assigned, in_progress, completed)
start_location TEXT (lat,lon)
start_latitude FLOAT
start_longitude FLOAT
end_location TEXT
end_latitude FLOAT
end_longitude FLOAT
started_at TIMESTAMP
completed_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

### 4. Ejecutar el app

```bash
npm run dev       # Iniciar Expo
npm run android   # En emulador/dispositivo Android
npm run ios       # En emulador/dispositivo iOS
npm run web       # En navegador (demo)
```

## Flujo de Usuario

1. **Login** → Pantalla de inicio de sesión
2. **Viajes** → Lista de viajes asignados como tarjetas
3. **Seleccionar Viaje** → Presiona una tarjeta
4. **Confirmar** → Modal de confirmación
5. **Iniciar** → Se captura ubicación y se actualiza en Supabase
6. **Éxito** → Viaje ahora muestra estado "in_progress"

## Funcionalidades Futuras

- [ ] Cierre de viaje con foto y ubicación final
- [ ] Reporte de incidencias en ruta
- [ ] Modo offline con sincronización
- [ ] Historial de viajes completados
- [ ] Chat con supervisor
- [ ] Notificaciones push
- [ ] Rastreo en vivo (tracking)

## Estructura de Archivos

```
src/
  App.js                          # App principal con navegación
  supabaseClient.js              # Cliente de Supabase
  screens/
    LoginScreen.js               # Pantalla de login
    TripsScreen.js              # Pantalla de viajes
  components/
    StartTripModal.js            # Modal de confirmación
```

## Notas de Desarrollo

- **Permisos**: El app solicita permiso de ubicación al iniciar un viaje
- **Auth**: Integrado con Supabase Auth
- **Navigation**: Usa React Navigation Stack
- **Styling**: StyleSheet nativo de React Native con tema oscuro
- **Estado**: useState para manejo de estado local

## Troubleshooting

**Error: "Este usuario no está registrado como piloto"**
- Verifica que exista un registro en la tabla `pilots` con el `user_id` correcto

**Ubicación no se captura**
- Asegúrate de haber otorgado permisos en el dispositivo
- En iOS, verifica que configuraste NSLocationWhenInUseUsageDescription en app.json

**No se sincronizan cambios**
- Verifica las credenciales de Supabase
- Revisa la conexión de internet
- Chequea los permisos de la BD (Row Level Security)
