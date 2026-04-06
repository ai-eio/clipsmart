const { clipboard } = require('electron')

let lastText = ''
let intervalId = null

function startMonitoring(onNewClip) {
  lastText = clipboard.readText()

  intervalId = setInterval(() => {
    try {
      const current = clipboard.readText()
      if (current !== lastText && current.trim().length > 0) {
        lastText = current
        onNewClip(current)
      }
    } catch {
      // Clipboard can be temporarily locked by other processes — ignore
    }
  }, 500)
}

function stopMonitoring() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

module.exports = { startMonitoring, stopMonitoring }
