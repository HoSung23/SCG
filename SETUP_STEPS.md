# 🎬 SCG Setup Video Script

## Para empezar el desarrollo real — 15 minutos

---

## ✅ Part 1: Verificar que todo está listo (1 min)

### En terminal:
```powershell
cd c:\Users\yoshi\Desktop\SCG
npm run build:backend    # Debería compilar sin errores
npm run build:web        # Debería compilar sin errores
```

**Resultado esperado**:
```
✓ tsc - sin errores
✓ vite build - X.XX kB gzipped
```

---

## 🔐 Part 2: Crear cuenta Supabase (3 min)

1. Abre https://supabase.com
2. Click "Sign Up"
3. Usa email + contraseña (o GitHub)
4. Verifica email
5. **Crea nuevo proyecto**:
   - Nombre: `scg-demo`
   - Region: US East (más rápido)
   - Contraseña segura
   - Click "Create new project" (espera 1-2 min)

**Resultado**: Proyecto creado, ver dashboard

---

## 🔑 Part 3: Copiar credenciales (1 min)

En Supabase dashboard:

1. Click "Settings" (esquina abajo izquierda)
2. Click "API"
3. Copia estos valores:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

**Ejemplo**:
```
SUPABASE_URL = https://abcdefgh.supabase.co
SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Part 4: Configurar .env (1 min)

En VS Code:

1. Abre `SCG/backend/.env`
2. Reemplaza valores:

```env
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
NODE_ENV=development
```

3. Ctrl+S para guardar

---

## 🗄️ Part 5: Crear tablas (3 min)

En Supabase:

1. Click "SQL Editor"
2. Click "New Query"
3. Copia **TODO** el SQL de `backend/SETUP.md` (sección "Crear tablas")
4. Pega en el editor
5. Click "Run" (ejecutar)

**Esperar**: 5-10 segundos hasta que compile

**Resultado**: 
```
✓ 8 queries executed
```

Refresh la página → ves las 8 tablas en "Tables"

---

## 🌱 Part 6: Seedear datos (2 min)

En terminal (PowerShell):

```powershell
cd c:\Users\yoshi\Desktop\SCG
npm run seed --workspace backend
```

**Ver output**:
```
🌱 Seeding database...
📦 Seeding trucks...
👨‍✈️ Seeding pilots...
✈️ Seeding trips...
🔧 Seeding maintenance...
⛽ Seeding fuel records...
💰 Seeding cost records...
🚨 Seeding alerts...
✅ Database seeding completed successfully!
```

Vuelve a Supabase → "trucks" table → deberías ver 10 camiones

---

## 🚀 Part 7: Iniciar servidores (2 min)

**Terminal 1** (Backend):
```powershell
cd c:\Users\yoshi\Desktop\SCG
npm run dev:backend
```

Espera a ver:
```
✓ Server running on http://localhost:3000
✓ Supabase connection successful
```

**Terminal 2** (Frontend):
```powershell
cd c:\Users\yoshi\Desktop\SCG
npm run dev:web
```

Espera a ver:
```
  Local:   http://localhost:5173/
```

---

## ✨ Part 8: Probar en navegador (2 min)

1. Abre http://localhost:5173
2. Ve al módulo **"Flota"** (navbar arriba)
3. Deberías ver:
   - ✅ 10 camiones desde Supabase
   - ✅ Botones para cambiar estado
   - ✅ Tabla con información real

4. Click en el botón "Cambiar estado" de un camión
5. Ve a Supabase → `trucks` table → verifica que el estado cambió

**Listo! 🎉 Frontend conectado a backend conectado a Supabase**

---

## 🧪 Bonus: Probar API directamente

En navegador, abre:

```
http://localhost:3000/api/trucks
```

Deberías ver JSON:
```json
[
  {
    "id": "...",
    "plate": "C-001BCD",
    "model": "Freightliner Cascadia",
    "status": "active",
    ...
  },
  ...
]
```

---

## 🛠️ Troubleshooting rápido

| Problema | Solución |
|----------|----------|
| `ENOENT: no such file or directory: '.env'` | Copia `backend/.env.example` a `backend/.env` y agrega credenciales |
| Backend no conecta a Supabase | Verifica SUPABASE_URL y SUPABASE_KEY estén correctos (sin espacios) |
| Frontend no carga datos | Abre DevTools → Network → http://localhost:3000/api/trucks debería tener status 200 |
| Port 3000 already in use | Cambia PORT en `.env` a 3001, y VITE_API_URL en `web/.env` a `http://localhost:3001/api` |
| Tablas no existen | Ve a Supabase SQL Editor → copia TODO el SQL de `backend/SETUP.md` → Run |

---

## 📊 Checklist Final

- [ ] Supabase project creado
- [ ] Credenciales en `backend/.env`
- [ ] 8 tablas creadas en Supabase
- [ ] Seed ejecutado (datos visibles en Supabase console)
- [ ] Backend corriendo en puerto 3000 (npm run dev:backend)
- [ ] Frontend corriendo en puerto 5173 (npm run dev:web)
- [ ] Navegador muestra datos reales en "Flota" module
- [ ] Cambios en frontend se guardan en Supabase

---

## 🎓 Qué hacer ahora

### Inmediato (hoy):
1. Sigue este script de setup
2. Verifica que todo funciona

### Corto plazo (esta semana):
- [ ] Agregar validación a las APIs (Zod schemas)
- [ ] Agregar logging (pino)
- [ ] Crear health check en backend

### Mediano plazo (próximas 2 semanas):
- [ ] Agregar Supabase Auth
- [ ] Crear login/registro UI
- [ ] Proteger rutas sensibles

### Largo plazo (mes siguiente):
- [ ] Sincronización offline
- [ ] GPS tracking
- [ ] Reportes/export

---

## 📚 Documentos de referencia

Después del setup, lee en este orden:

1. **DEVELOPMENT.md** — Guía completa
2. **backend/SETUP.md** — Configuración backend específica
3. **DATABASE.md** — Esquema de datos
4. **COMMANDS.md** — Comandos útiles

---

## 💬 Tips

- **No commits credenciales**: `.env` nunca en git
- **Usa Service Role Key solo en server**: Frontend solo usa anon key
- **Supabase tiene logs**: SQL Editor → Logs tab
- **Postman es útil**: Para probar APIs antes de conectar frontend
- **Hot-reload funciona**: npm run dev:backend recarga automático en cambios

---

**Tiempo total**: ~15 minutos  
**Resultado**: Full-stack app funcionando (frontend + backend + database)

¡Listo para empezar desarrollo real! 🚀
