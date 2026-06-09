import { app, BrowserWindow } from 'electron'
import path from 'node:path'

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'dist/preload/index.js')
    }
  })

  const url = process.env.ELECTRON_DEV_URL || 'http://localhost:3000'
  void window.loadURL(url)
}

app.whenReady().then(createWindow)
