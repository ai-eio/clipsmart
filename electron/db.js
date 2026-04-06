const path = require('path')
const { app } = require('electron')
const fs = require('fs')

const getStoragePath = () => path.join(app.getPath('userData'), 'clips.json')

const MAX_UNPINNED = 1000

let clips = []
let initialized = false

function initDB() {
  if (initialized) return
  try {
    const raw = fs.readFileSync(getStoragePath(), 'utf8')
    clips = JSON.parse(raw)
  } catch {
    clips = []
  }
  initialized = true
}

function persist() {
  try {
    fs.writeFileSync(getStoragePath(), JSON.stringify(clips))
  } catch (e) {
    console.error('Failed to persist clips:', e.message)
  }
}

function detectType(content) {
  const t = content.trim()
  if (/^https?:\/\//i.test(t)) return 'url'
  if (/^[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(t)) return 'email'
  if (/^\+?[\d][\d\s\-().]{6,14}$/.test(t)) return 'phone'
  if (/function |const |let |var |=>|class |import |require\(|#include|\bdef \b|<\?php/.test(content)) return 'code'
  return 'text'
}

function saveClip(content) {
  if (!content || content.trim().length === 0) return null

  // Skip duplicate of most recent
  const recent = clips.find((c) => !c.pinned)
  if (recent && recent.content === content) return null

  const clip = {
    id: Date.now(),
    content,
    type: detectType(content),
    pinned: false,
    created_at: Math.floor(Date.now() / 1000),
  }

  clips.unshift(clip)

  // Trim unpinned to MAX
  const unpinned = clips.filter((c) => !c.pinned)
  if (unpinned.length > MAX_UNPINNED) {
    const toRemove = new Set(unpinned.slice(MAX_UNPINNED).map((c) => c.id))
    clips = clips.filter((c) => !toRemove.has(c.id))
  }

  persist()
  return clip
}

function sorted() {
  return [...clips.filter((c) => c.pinned), ...clips.filter((c) => !c.pinned)]
}

function getClips(limit = 100, offset = 0) {
  return sorted().slice(offset, offset + limit)
}

function searchClips(query) {
  if (!query || !query.trim()) return getClips()
  const q = query.toLowerCase()
  const matches = clips.filter((c) => c.content.toLowerCase().includes(q))
  return [...matches.filter((c) => c.pinned), ...matches.filter((c) => !c.pinned)].slice(0, 200)
}

function deleteClip(id) {
  clips = clips.filter((c) => c.id !== id)
  persist()
  return true
}

function togglePin(id) {
  const clip = clips.find((c) => c.id === id)
  if (!clip) return false
  clip.pinned = !clip.pinned
  persist()
  return true
}

function clearAll() {
  clips = clips.filter((c) => c.pinned)
  persist()
  return true
}

module.exports = { initDB, saveClip, getClips, searchClips, deleteClip, togglePin, clearAll }
