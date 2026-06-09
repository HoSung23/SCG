const { app, BrowserWindow } = require('electron')
const { existsSync } = require('fs')
const path = require('path')

const WEB_DEV_URL = process.env.SCG_WEB_URL || 'http://localhost:5173'
const DEV_URL_CANDIDATES = Array.from(new Set([WEB_DEV_URL, 'http://localhost:5173', 'http://localhost:5174']))
const WEB_DIST_INDEX = path.join(__dirname, '../web/dist/index.html')

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function canReachUrl(url) {
  try {
    const response = await fetch(url, { method: 'GET' })
    return response.ok
  } catch {
    return false
  }
}

async function waitForDevServer(url, attempts = 20, delayMs = 400) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const isReachable = await canReachUrl(url)
    if (isReachable) {
      return true
    }

    await sleep(delayMs)
  }

  return false
}

function buildFallbackHtml(url) {
  return `data:text/html;charset=utf-8,
    <html>
      <head>
        <meta charset="utf-8" />
        <title>SCG Desktop</title>
        <style>
          body { font-family: Segoe UI, Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; }
          .wrap { max-width: 760px; margin: 80px auto; padding: 24px; border: 1px solid #334155; border-radius: 12px; background: #111827; }
          h1 { margin-top: 0; }
          code { background: #0b1320; padding: 2px 6px; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>SCG Desktop</h1>
          <p>No se pudo conectar con la app web de desarrollo.</p>
          <p>Verifica que esté corriendo en <code>${url}</code> con <code>npm run dev:web</code>.</p>
          <p>Luego cierra y vuelve a abrir Electron.</p>
        </div>
      </body>
    </html>`
}

async function findReachableDevUrl() {
  for (const url of DEV_URL_CANDIDATES) {
    const isReady = await waitForDevServer(url, 8, 300)
    if (isReady) {
      return url
    }
  }

  return null
}

async function loadDevOrFallback(win) {
  const reachableUrl = await findReachableDevUrl()

  if (reachableUrl) {
    await win.loadURL(reachableUrl)
    return
  }

  if (existsSync(WEB_DIST_INDEX)) {
    await win.loadFile(WEB_DIST_INDEX)
    return
  }

  await win.loadURL(buildFallbackHtml(WEB_DEV_URL))
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    title: 'SCG Desktop',
    webPreferences: {
      contextIsolation: true
    }
  })

  win.webContents.on('did-fail-load', async () => {
    if (!app.isPackaged && existsSync(WEB_DIST_INDEX)) {
      await win.loadFile(WEB_DIST_INDEX)
    }
  })

  if (!app.isPackaged) {
    await loadDevOrFallback(win)
    return
  }

  win.loadFile(WEB_DIST_INDEX)
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
