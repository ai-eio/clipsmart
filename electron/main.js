const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, clipboard, nativeImage, screen } = require('electron')
const path = require('path')
const fs = require('fs')
const { initDB, saveClip, getClips, deleteClip, togglePin, searchClips, clearAll } = require('./db')
const { startMonitoring, stopMonitoring } = require('./clipboardMonitor')

const isDev = process.argv.includes('--dev')

let mainWindow = null
let tray = null

// Single instance lock
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
}

app.on('second-instance', () => {
  toggleWindow()
})

function createTrayIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <rect width="16" height="16" rx="3" fill="#7c6bf0"/>
    <text x="8" y="12" text-anchor="middle" fill="white" font-size="11" font-family="Arial,sans-serif" font-weight="bold">C</text>
  </svg>`
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  try {
    return nativeImage.createFromDataURL(dataUrl)
  } catch {
    return nativeImage.createEmpty()
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 600,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('blur', () => {
    mainWindow.hide()
  })
}

function positionWindow() {
  if (!mainWindow) return
  const cursor = screen.getCursorScreenPoint()
  const display = screen.getDisplayNearestPoint(cursor)
  const { x, y, width, height } = display.workArea
  const [winWidth, winHeight] = mainWindow.getSize()

  let winX = cursor.x - winWidth / 2
  let winY = cursor.y - winHeight / 2

  winX = Math.max(x, Math.min(winX, x + width - winWidth))
  winY = Math.max(y, Math.min(winY, y + height - winHeight))

  mainWindow.setPosition(Math.round(winX), Math.round(winY))
}

function toggleWindow() {
  if (!mainWindow) return
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    positionWindow()
    mainWindow.show()
    mainWindow.focus()
    mainWindow.webContents.send('window-shown')
  }
}

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'settings.json')
}

function readSettings() {
  try {
    if (fs.existsSync(getSettingsPath())) {
      return JSON.parse(fs.readFileSync(getSettingsPath(), 'utf8'))
    }
  } catch {}
  return {}
}

function writeSettings(settings) {
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2))
}

app.whenReady().then(() => {
  initDB()
  createWindow()

  // Tray
  const icon = createTrayIcon()
  tray = new Tray(icon)
  tray.setToolTip('ClipSmart — Ctrl+Shift+V')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open ClipSmart', click: toggleWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ])
  tray.setContextMenu(contextMenu)
  tray.on('click', toggleWindow)

  // Global hotkey
  const registered = globalShortcut.register('CommandOrControl+Shift+V', toggleWindow)
  if (!registered) {
    console.warn('Global shortcut registration failed')
  }

  // Clipboard monitoring
  startMonitoring((content) => {
    const clip = saveClip(content)
    if (clip && mainWindow && mainWindow.isVisible()) {
      mainWindow.webContents.send('new-clip', clip)
    }
  })

  // IPC
  ipcMain.handle('get-clips', (_, limit, offset) => getClips(limit, offset))
  ipcMain.handle('search-clips', (_, query) => searchClips(query))
  ipcMain.handle('delete-clip', (_, id) => deleteClip(id))
  ipcMain.handle('toggle-pin', (_, id) => togglePin(id))
  ipcMain.handle('clear-all', () => clearAll())

  ipcMain.handle('copy-to-clipboard', (_, text) => {
    clipboard.writeText(text)
    mainWindow.hide()
    return true
  })

  ipcMain.handle('hide-window', () => {
    mainWindow.hide()
  })

  ipcMain.handle('get-settings', () => readSettings())

  ipcMain.handle('save-settings', (_, settings) => {
    writeSettings(settings)
    return true
  })

  ipcMain.handle('ai-search', async (_, query, clips) => {
    const settings = readSettings()
    const apiKey = settings.anthropicApiKey
    if (!apiKey) return null

    try {
      const Anthropic = require('@anthropic-ai/sdk')
      const client = new (Anthropic.default || Anthropic)({ apiKey })

      const clipSummaries = clips
        .slice(0, 100)
        .map((c, i) => `[${i}] ${c.content.slice(0, 120).replace(/\n/g, ' ')}`)
        .join('\n')

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: `Search query: "${query}"\n\nFind the most relevant clipboard items. Return ONLY a JSON array of indices (e.g. [2, 0, 4]). Return [] if nothing matches. Max 8 results.\n\nItems:\n${clipSummaries}`,
          },
        ],
      })

      const text = response.content[0].text.trim()
      const match = text.match(/\[[\d,\s]*\]/)
      if (!match) return null
      const indices = JSON.parse(match[0])
      return indices.map((i) => clips[i]).filter(Boolean)
    } catch (e) {
      console.error('AI search error:', e.message)
      return null
    }
  })
})

app.on('window-all-closed', (e) => {
  e.preventDefault()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  stopMonitoring()
})
