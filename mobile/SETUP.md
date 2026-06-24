# Instrucciones de Setup - SCG Mobile

## Requisitos Previos

- Node.js 18+ y npm o pnpm
- Dispositivo Android/iOS o emulador
- Cuenta en Supabase (https://supabase.com)

## Paso 1: Instalar Dependencias

```bash
cd mobile
npm install
# o si usas pnpm:
pnpm install
```

Esto instalará:
- `expo` - Framework React Native
- `expo-location` - Para captura de GPS
- `expo-status-bar` - Barra de estado
- `@react-navigation/native` y `@react-navigation/stack` - Navegación
- `react-native-safe-area-context` - Safe area
- `react-native-gesture-handler` - Gestos
- `@supabase/supabase-js` - Cliente de Supabase

## Paso 2: Configurar Supabase

### 2.1 Crear proyecto en Supabase

1. Ve a https://app.supabase.com
2. Crea un nuevo proyecto
3. En Settings → API, copia:
   - `Project URL`
   - `anon public key`

### 2.2 Actualizar `supabaseClient.js`

```bash
cd src
nano supabaseClient.js  # o abre en tu editor
```

Reemplaza:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_KEY = 'your-anon-key'
```

Con tus credenciales reales.

### 2.3 Crear tablas en Supabase

Ve a Supabase Dashboard → SQL Editor y ejecuta:

```sql
-- Tabla de pilotos
CREATE TABLE pilots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de viajes
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_pilot_id UUID NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance INTEGER NOT NULL,
  cargo_type TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  start_location TEXT,
  start_latitude FLOAT,
  start_longitude FLOAT,
  end_location TEXT,
  end_latitude FLOAT,
  end_longitude FLOAT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX idx_pilots_user_id ON pilots(user_id);
CREATE INDEX idx_trips_pilot_id ON trips(assigned_pilot_id);
CREATE INDEX idx_trips_status ON trips(status);
```

### 2.4 Habilitar Row Level Security (RLS)

En Supabase → Authentication → Policies, habilita RLS para las tablas y añade:

```sql
-- Para tabla pilots
CREATE POLICY "Pilots can view their own data"
  ON pilots FOR SELECT
  USING (auth.uid() = user_id);

-- Para tabla trips
CREATE POLICY "Pilots can view their assigned trips"
  ON trips FOR SELECT
  USING (assigned_pilot_id = (SELECT id FROM pilots WHERE user_id = auth.uid()));

CREATE POLICY "Pilots can update their assigned trips"
  ON trips FOR UPDATE
  USING (assigned_pilot_id = (SELECT id FROM pilots WHERE user_id = auth.uid()));
```

### 2.5 Crear usuarios de prueba

En Supabase → Authentication → Users, crea un usuario:
- Email: `pilot1@example.com`
- Password: `password123`

Luego inserta el piloto correspondiente:

```sql
INSERT INTO pilots (user_id, name, phone, license_number, status)
VALUES (
  'USER_ID_FROM_SUPABASE',  -- Copia el ID del usuario creado
  'Juan Pérez',
  '+502-1234-5678',
  'LIC-001',
  'active'
);

-- Agregar algunos viajes de prueba
INSERT INTO trips (assigned_pilot_id, origin, destination, distance, cargo_type, status, notes)
VALUES (
  (SELECT id FROM pilots WHERE name = 'Juan Pérez'),
  'Guatemala City',
  'Puerto Barrios',
  285,
  'Electrodomésticos',
  'assigned',
  'Entregas a 3 puntos diferentes'
);
```

## Paso 3: Ejecutar el App

### Opción 1: Expo Go en tu dispositivo (Recomendado para dev)

```bash
npm run dev
```

Escanea el código QR con:
- **iOS**: Cámara o app de Expo Go
- **Android**: App de Expo Go

### Opción 2: Emulador Android

```bash
npm run android
```

Requisitos: Android Studio con emulador configurado

### Opción 3: Emulador iOS (macOS solo)

```bash
npm run ios
```

Requisitos: Xcode instalado

### Opción 4: Web (demo)

```bash
npm run web
```

Abre http://localhost:19006 en tu navegador

## Paso 4: Pruebas

1. Inicia la app
2. Login con: `pilot1@example.com` / `password123`
3. Deberías ver 2-3 viajes asignados
4. Toca un viaje para ver el modal
5. Presiona "Sí, Iniciar Viaje"
6. El app solicitará permiso de ubicación
7. Si todo funciona, verás "Viaje iniciado correctamente"

## Troubleshooting

### Error: "expo is not defined"
```bash
npm install expo -g
expo login
```

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### La ubicación no se captura
- iOS: Verifica en Settings → Privacy → Location
- Android: Verifica permisos en Settings → Apps → SCG

### No se sincroniza con Supabase
- Verifica que las credenciales en `supabaseClient.js` sean correctas
- Verifica que haya conexión a internet
- Revisa que RLS esté configurado correctamente

### Cambios no se reflejan
```bash
# Limpia caché
expo start --clear
```

## Estructura Final

```
mobile/
├── app.json
├── package.json
├── index.js
├── README.md
├── .env.example
└── src/
    ├── App.js
    ├── supabaseClient.js
    ├── screens/
    │   ├── LoginScreen.js
    │   └── TripsScreen.js
    ├── components/
    │   └── StartTripModal.js
    ├── utils/
    │   └── helpers.js
    └── constants/
        └── mockData.js
```

## Next Steps

Una vez funcione el login y viajes:

1. Crear pantalla de viaje en progreso (mostrando mapa)
2. Crear pantalla de finalización de viaje
3. Agregar fotos/evidencia
4. Modo offline con sincronización
5. Notificaciones push
6. Rastreo en vivo
