#!/usr/bin/env node

/**
 * 🚀 CHECKLIST DE CONFIGURACIÓN - SCG Mobile
 * 
 * Ejecuta este checklist antes de hacer testing del app
 * Cada paso es crítico para el funcionamiento
 */

const CHECKLIST = [
  {
    step: 1,
    title: "Dependencias instaladas",
    command: "npm install",
    verify: "Chequea que node_modules/ exista",
    critical: true
  },
  {
    step: 2,
    title: "Supabase configurado",
    action: "Actualiza src/supabaseClient.js",
    items: [
      "• Copia Project URL de Supabase",
      "• Copia anon public key",
      "• Reemplaza SUPABASE_URL y SUPABASE_KEY"
    ],
    critical: true
  },
  {
    step: 3,
    title: "Tablas de BD creadas",
    action: "Ejecuta SQL en Supabase → SQL Editor",
    files: "Ver SETUP.md para scripts",
    tables: ["pilots", "trips"],
    critical: true
  },
  {
    step: 4,
    title: "Row Level Security habilitado",
    action: "Ve a Authentication → Policies",
    items: [
      "• Habilita RLS en tabla 'pilots'",
      "• Habilita RLS en tabla 'trips'",
      "• Agrega políticas de acceso"
    ],
    critical: true
  },
  {
    step: 5,
    title: "Usuarios de prueba creados",
    action: "Authentication → Users",
    items: [
      "• Email: pilot1@example.com",
      "• Password: password123",
      "• Copia el user_id"
    ],
    critical: true
  },
  {
    step: 6,
    title: "Registro de piloto creado",
    action: "SQL → Ejecuta INSERT",
    items: [
      "INSERT INTO pilots (user_id, name, phone, license_number, status)",
      "VALUES ('USER_ID_AQUI', 'Juan Pérez', '+502-1234-5678', 'LIC-001', 'active')"
    ],
    critical: true
  },
  {
    step: 7,
    title: "Viajes de prueba creados",
    action: "SQL → Ejecuta INSERT para viajes",
    items: [
      "INSERT INTO trips (assigned_pilot_id, origin, destination, ...)",
      "Al menos 2-3 viajes con status 'assigned'"
    ],
    critical: true
  },
  {
    step: 8,
    title: "Permisos de ubicación",
    action: "Verifica app.json",
    items: [
      "• Android: permissions en app.json",
      "• iOS: NSLocationWhenInUseUsageDescription en infoPlist"
    ],
    critical: true
  },
  {
    step: 9,
    title: "React Navigation instalado",
    action: "npm install",
    packages: [
      "@react-navigation/native",
      "@react-navigation/stack",
      "react-native-screens",
      "react-native-safe-area-context"
    ],
    critical: true
  },
  {
    step: 10,
    title: "Expo Go instalado (opcional)",
    action: "Descarga app en Play Store o App Store",
    items: [
      "• Para testing en dispositivo real",
      "• Es el método más rápido para development"
    ],
    critical: false
  }
]

/**
 * TESTING FLOW
 */
const TESTING = {
  title: "🧪 TESTING FLOW",
  steps: [
    "1. npm run dev (inicia Expo)",
    "2. Escanea código QR con Expo Go",
    "3. Espera que cargue el app",
    "4. Login con: pilot1@example.com / password123",
    "5. Deberías ver 2-3 viajes en la lista",
    "6. Toca un viaje para abrir modal",
    "7. Presiona 'Sí, Iniciar Viaje'",
    "8. Acepta permiso de ubicación",
    "9. Deberías ver 'Viaje iniciado correctamente'",
    "10. Verifica en Supabase que se actualizó el trip"
  ]
}

/**
 * TROUBLESHOOTING RÁPIDO
 */
const TROUBLESHOOTING = {
  "App no inicia": {
    solutions: [
      "npm install",
      "expo start --clear",
      "Verifica que Node.js esté instalado (v18+)"
    ]
  },
  "Login falla": {
    solutions: [
      "Verifica credentials en supabaseClient.js",
      "Chequea que el usuario exista en Supabase Auth",
      "Verifica que el registro en tabla pilots exista"
    ]
  },
  "No aparecen viajes": {
    solutions: [
      "Verifica que existan registros en tabla trips",
      "Chequea que assigned_pilot_id sea correcto",
      "Verifica que status sea 'assigned' o 'pending'"
    ]
  },
  "GPS no funciona": {
    solutions: [
      "Verifica permisos en dispositivo (Settings → Location)",
      "En iOS: chequea NSLocationWhenInUseUsageDescription",
      "En Android: chequea permissions en app.json"
    ]
  },
  "Cambios no se reflejan": {
    solutions: [
      "expo start --clear (limpia caché)",
      "Mata el proceso y reinicia",
      "Cierra completamente la app y Expo Go"
    ]
  }
}

/**
 * Print helpers
 */
function printHeader(text) {
  console.log("\n" + "=".repeat(60))
  console.log("  " + text)
  console.log("=".repeat(60) + "\n")
}

function printCheckpoint(checkpoint) {
  const status = checkpoint.critical ? "🔴 CRÍTICO" : "🔵 OPCIONAL"
  console.log(`\n[${checkpoint.step}] ${checkpoint.title} - ${status}`)
  console.log("-".repeat(50))
  
  if (checkpoint.command) console.log(`   Comando: ${checkpoint.command}`)
  if (checkpoint.action) console.log(`   Acción: ${checkpoint.action}`)
  if (checkpoint.verify) console.log(`   Verifica: ${checkpoint.verify}`)
  if (checkpoint.files) console.log(`   Archivos: ${checkpoint.files}`)
  if (checkpoint.tables) console.log(`   Tablas: ${checkpoint.tables.join(", ")}`)
  if (checkpoint.packages) {
    console.log(`   Paquetes:`)
    checkpoint.packages.forEach(p => console.log(`     • ${p}`))
  }
  if (checkpoint.items) {
    console.log(`   Items:`)
    checkpoint.items.forEach(item => console.log(`     ${item}`))
  }
}

function printTesting() {
  printHeader("🧪 TESTING FLOW")
  TESTING.steps.forEach(step => console.log(step))
  console.log("\n✅ Si todos los pasos funcionan, el app está listo!")
}

function printTroubleshooting() {
  printHeader("🔧 TROUBLESHOOTING RÁPIDO")
  Object.entries(TROUBLESHOOTING).forEach(([issue, solutions]) => {
    console.log(`\n❌ ${issue}`)
    solutions.solutions.forEach(sol => console.log(`   ✓ ${sol}`))
  })
}

/**
 * MAIN
 */
function main() {
  printHeader("📱 SCG MOBILE - CHECKLIST DE CONFIGURACIÓN")
  
  console.log("Completá este checklist antes de hacer testing.\n")
  console.log("Haz check en cada paso:\n")
  
  CHECKLIST.forEach(checkpoint => {
    printCheckpoint(checkpoint)
    console.log(`   [ ] Completado`)
  })
  
  printTesting()
  printTroubleshooting()
  
  printHeader("✨ ESTADO FINAL")
  console.log("Si completaste TODO el checklist y no hay errores,")
  console.log("¡el app está listo para development y testing! 🚀\n")
}

// Run
if (require.main === module) {
  main()
}

module.exports = { CHECKLIST, TESTING, TROUBLESHOOTING }
