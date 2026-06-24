# 🎉 SCG Mobile - Quick Start Guide

## ¿Qué se implementó?

Un **app móvil completo** para pilotos en React Native + Expo con:

✅ **Login seguro** - Email/contraseña con Supabase Auth
✅ **Dashboard de viajes** - Lista de viajes asignados con tarjetas
✅ **Modal de confirmación** - Detalles antes de iniciar
✅ **Captura de GPS** - Ubicación automática al iniciar viaje
✅ **Sincronización** - Actualiza automáticamente en Supabase
✅ **Navegación fluida** - React Navigation integrado
✅ **UI moderna** - Tema oscuro profesional

---

## 🚀 Comenzar en 5 minutos

### 1. Instalar dependencias
```bash
cd mobile
npm install
```

### 2. Configurar Supabase
Edita `src/supabaseClient.js`:
```javascript
const SUPABASE_URL = 'tu-url-aqui'
const SUPABASE_KEY = 'tu-key-aqui'
```

### 3. Crear BD (Copia/pega en Supabase SQL Editor)
```sql
-- Ve al archivo SQL_QUERIES.sql en esta carpeta
-- Secciones 1-4 (crear tablas, habilitar RLS, crear usuario, crear viajes)
```

### 4. Ejecutar app
```bash
npm run dev
# Escanea QR con Expo Go
```

### 5. Probar
- Login: `pilot1@example.com` / `password123`
- Deberías ver 2-3 viajes
- Presiona uno y verás el modal
- Presiona "Iniciar Viaje" → GPS capturado

---

## 📁 Estructura de Archivos

```
src/
├── App.js                      ← Navegación principal
├── supabaseClient.js           ← Conexión a Supabase
├── screens/
│   ├── LoginScreen.js          ← Pantalla de login
│   └── TripsScreen.js          ← Lista de viajes
├── components/
│   └── StartTripModal.js       ← Modal de confirmación
├── utils/
│   └── helpers.js              ← Funciones auxiliares (GPS, fechas, etc)
└── constants/
    └── mockData.js             ← Datos de prueba
```

---

## 🔄 Flujo de Usuario

```
1. INICIO
   ↓
2. LOGIN (email + password)
   ↓
3. LISTA DE VIAJES (tarjetas clickeables)
   ↓
4. SELECCIONA UN VIAJE (abre modal)
   ↓
5. CONFIRMA INICIO (se solicita GPS)
   ↓
6. GPS CAPTURADO (se sube a Supabase)
   ↓
7. ÉXITO (viaje cambia a "in_progress")
```

---

## 📊 Base de Datos

**Tabla: pilots**
- id, user_id, name, phone, license_number, status

**Tabla: trips**
- id, assigned_pilot_id, origin, destination, distance, cargo_type, status
- start_location, start_latitude, start_longitude (se completan al iniciar)
- end_location, end_latitude, end_longitude (para próxima feature)
- started_at, completed_at (timestamps)

---

## 🔧 Troubleshooting

| Problema | Solución |
|----------|----------|
| "No aparecen viajes" | Verifica que existan en trips con status='assigned' |
| "Login falla" | Chequea credenciales en supabaseClient.js |
| "GPS no funciona" | Otorga permisos en Settings del dispositivo |
| "Cambios no se ven" | `expo start --clear` (limpia caché) |
| "Module not found" | `npm install` nuevamente |

---

## 📚 Documentación Completa

- `README.md` - Descripción general
- `SETUP.md` - Instalación paso a paso
- `ARCHITECTURE.md` - Diagramas y estructura técnica
- `IMPLEMENTED.md` - Resumen de lo que se hizo
- `SQL_QUERIES.sql` - Todos los queries necesarios
- `CHECKLIST.js` - Verificación de setup

---

## 🎯 Próximas Features

- [ ] Pantalla de "Viaje en Progreso" con mapa
- [ ] Finalización de viaje con foto/firma
- [ ] Modo offline con sincronización
- [ ] Historial de viajes completados
- [ ] Chat con supervisor
- [ ] Notificaciones push
- [ ] Rastreo en vivo (admin)

---

## 💻 Comandos Útiles

```bash
# Iniciar en Expo
npm run dev

# En Android
npm run android

# En iOS
npm run ios

# En Web (demo)
npm run web

# Limpiar caché
expo start --clear
```

---

## 🔐 Seguridad

✅ Autenticación con Supabase Auth
✅ Row Level Security en BD (pilotos ven solo sus datos)
✅ Permisos de GPS requeridos
✅ Validaciones en frontend
✅ No se guardan contraseñas

---

## ❓ ¿Preguntas?

Revisa:
1. Los archivos .md en esta carpeta (detalles técnicos)
2. SQL_QUERIES.sql (ejemplos de BD)
3. CHECKLIST.js (verificación)

¡El app está listo para usarse! 🚀
