# 🎯 SCG Quick Commands

## 📦 Setup (First time only)

```powershell
# 1. Install all dependencies
cd c:\Users\yoshi\Desktop\SCG
npm install --workspaces

# 2. Create .env in backend
Copy-Item .\backend\.env.example .\backend\.env
# Edit .env with your Supabase credentials

# 3. Create tables in Supabase SQL Editor
# (Copy SQL from backend/SETUP.md)

# 4. Seed database
npm run seed --workspace backend
```

## 🚀 Development (Every time)

```powershell
# Terminal 1: Backend API
cd c:\Users\yoshi\Desktop\SCG
npm run dev:backend
# → http://localhost:3000/api

# Terminal 2: Frontend Web
cd c:\Users\yoshi\Desktop\SCG
npm run dev:web
# → http://localhost:5173

# Terminal 3: Desktop App (optional)
cd c:\Users\yoshi\Desktop\SCG
npm run dev:electron
```

## 📋 Useful Commands

```powershell
# Build everything
npm run build:web
npm run build:backend

# Build specific workspace
npm run build --workspace web
npm run build --workspace backend

# Run dev server
npm run dev:web
npm run dev:backend
npm run dev:mobile
npm run dev:electron

# Install dependencies for specific workspace
npm install --workspace backend
npm install --workspace web

# Seed database
npm run seed --workspace backend

# Check TypeScript errors
npm run build:backend
npm run build:web

# Start backend in production
npm run start:backend

# View logs (after start)
# Check your terminal for output
```

## 🧪 Testing API Locally

### Using browser:
```
http://localhost:3000/api/trucks
http://localhost:3000/api/pilots
http://localhost:3000/api/trips
```

### Using curl/PowerShell:
```powershell
# List trucks
curl http://localhost:3000/api/trucks | ConvertFrom-Json | ConvertTo-Json

# List pilots
curl http://localhost:3000/api/pilots

# List trips
curl http://localhost:3000/api/trips
```

### Using Postman/Insomnia:
```
POST http://localhost:3000/api/trucks
Content-Type: application/json

{
  "plate": "C-TEST01",
  "model": "Test Truck",
  "year": 2024,
  "fuelKmPerGallon": 8.5,
  "ownershipType": "propia"
}
```

## 🔐 Environment Variables

### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/src/index.ts` | Server entry point |
| `backend/src/seed.ts` | Database seeding |
| `web/src/services/api.ts` | Frontend API client |
| `web/src/App.tsx` | Main UI component |
| `DEVELOPMENT.md` | Full setup guide |
| `backend/SETUP.md` | Backend setup guide |
| `STATUS.md` | Current status report |

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# If port is in use, change PORT in .env to 3001
# Then update VITE_API_URL in web/.env to http://localhost:3001/api
```

### Supabase connection fails
```powershell
# Check .env file exists
ls backend\.env

# Check credentials are correct
# Copy from https://app.supabase.com/project/YOUR-PROJECT/settings/api
```

### Frontend can't find backend
```powershell
# Make sure backend is running
npm run dev:backend

# Check frontend .env has correct API URL
cat web\.env

# Check browser DevTools → Network tab
# Requests to http://localhost:3000/api should succeed
```

### TypeScript errors
```powershell
# Rebuild to see errors
npm run build:backend
npm run build:web

# Most common: missing .env file or wrong port
```

## 📊 Project Layout

```
cd SCG/
  └─ backend/          # Node.js API
     ├─ src/
     ├─ dist/          # Compiled output
     ├─ .env           # Supabase credentials (CREATE THIS)
     └─ package.json
  
  └─ web/              # React UI
     ├─ src/
     ├─ dist/          # Vite build output
     ├─ .env           # API URL (OPTIONAL)
     └─ package.json
  
  └─ mobile/           # React Native (future)
  └─ electron/         # Desktop shell
```

## 🎓 Learning Resources

- **Supabase**: https://supabase.com/docs
- **Express**: https://expressjs.com/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **TypeScript**: https://www.typescriptlang.org/

## 📞 Quick Reference

| Need | Solution |
|------|----------|
| Change API port | Edit `backend/.env` PORT, then update `web/.env` VITE_API_URL |
| Add new table | Edit SQL in Supabase → Run in SQL Editor → Update `backend/src/types/index.ts` |
| Add new endpoint | Create controller file → Create route file → Import in `backend/src/index.ts` |
| Test specific endpoint | Use `npm run dev:backend` then curl/Postman to http://localhost:3000/api/... |
| Deploy backend | Build: `npm run build:backend` → Upload to Vercel/Render/AWS |
| Deploy frontend | Build: `npm run build:web` → Upload to Vercel/Netlify |

---

**Last Updated**: June 2026  
**Version**: 0.1.0
