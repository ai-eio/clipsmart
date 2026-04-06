import React, { useState, useEffect, useRef, useCallback } from 'react'
import SearchBar from './components/SearchBar'
import ClipList from './components/ClipList'
import Settings from './components/Settings'

export default function App() {
  const [clips, setClips] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiSearching, setAiSearching] = useState(false)
  const [view, setView] = useState('clips')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [notification, setNotification] = useState(null)
  const searchTimeout = useRef(null)
  const appRef = useRef(null)

  const showNotification = useCallback((msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 2000)
  }, [])

  const loadClips = useCallback(async () => {
    const result = await window.clipAPI.getClips(200, 0)
    setClips(result)
    setSelectedIndex(0)
  }, [])

  useEffect(() => {
    loadClips()

    window.clipAPI.onNewClip((clip) => {
      setClips((prev) => {
        if (prev[0]?.content === clip.content) return prev
        return [clip, ...prev].slice(0, 1000)
      })
      setSelectedIndex(0)
    })

    window.clipAPI.onWindowShown(() => {
      setQuery('')
      setView('clips')
      setSelectedIndex(0)
      loadClips()
      appRef.current?.focus()
    })
  }, [loadClips])

  const handleSearch = useCallback(
    (value) => {
      setQuery(value)
      setSelectedIndex(0)
      clearTimeout(searchTimeout.current)

      if (!value.trim()) {
        loadClips()
        return
      }

      searchTimeout.current = setTimeout(async () => {
        setLoading(true)
        const results = await window.clipAPI.searchClips(value)
        setClips(results)
        setLoading(false)
      }, 200)
    },
    [loadClips]
  )

  const handleAiSearch = useCallback(async () => {
    if (!query.trim() || aiSearching) return
    setAiSearching(true)
    const allClips = await window.clipAPI.getClips(200, 0)
    const results = await window.clipAPI.aiSearch(query, allClips)
    setAiSearching(false)
    if (results) {
      setClips(results)
    } else {
      showNotification('Add an Anthropic API key in Settings to use AI search')
    }
  }, [query, aiSearching, showNotification])

  const handleCopy = useCallback((content) => {
    window.clipAPI.copyToClipboard(content)
  }, [])

  const handleDelete = useCallback(async (id) => {
    await window.clipAPI.deleteClip(id)
    setClips((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const handlePin = useCallback(async (id) => {
    await window.clipAPI.togglePin(id)
    setClips((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
      return [...updated.filter((c) => c.pinned), ...updated.filter((c) => !c.pinned)]
    })
  }, [])

  const handleClearAll = useCallback(async () => {
    await window.clipAPI.clearAll()
    setClips((prev) => prev.filter((c) => c.pinned))
    showNotification('History cleared')
  }, [showNotification])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        window.clipAPI.hideWindow()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, clips.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (clips[selectedIndex]) {
          handleCopy(clips[selectedIndex].content)
        }
      }
    },
    [clips, selectedIndex, handleCopy]
  )

  return (
    <div className="app" onKeyDown={handleKeyDown} tabIndex={-1} ref={appRef}>
      <div className="titlebar">
        <div className="titlebar-left">
          <span className="app-logo">⌨</span>
          <span className="app-title">ClipSmart</span>
        </div>
        <div className="titlebar-actions">
          <button
            className={`icon-btn ${view === 'settings' ? 'active' : ''}`}
            onClick={() => setView((v) => (v === 'settings' ? 'clips' : 'settings'))}
            title="Settings"
          >
            ⚙
          </button>
        </div>
      </div>

      {notification && <div className="notification">{notification}</div>}

      {view === 'clips' ? (
        <>
          <SearchBar
            value={query}
            onChange={handleSearch}
            onAiSearch={handleAiSearch}
            aiSearching={aiSearching}
            loading={loading}
          />
          <ClipList
            clips={clips}
            selectedIndex={selectedIndex}
            onCopy={handleCopy}
            onDelete={handleDelete}
            onPin={handlePin}
            onSelect={setSelectedIndex}
          />
          <div className="statusbar">
            <span>{clips.length} item{clips.length !== 1 ? 's' : ''}</span>
            {clips.length > 0 && (
              <button className="clear-btn" onClick={handleClearAll} title="Clear history">
                Clear all
              </button>
            )}
            <span className="hint">↵ copy · ↑↓ nav · Esc close</span>
          </div>
        </>
      ) : (
        <Settings onClose={() => setView('clips')} />
      )}
    </div>
  )
}
