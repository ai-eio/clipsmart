import React, { useState, useEffect } from 'react'

export default function Settings({ onClose }) {
  const [settings, setSettings] = useState({
    anthropicApiKey: '',
    maxItems: 1000,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.clipAPI.getSettings().then((s) => {
      setSettings((prev) => ({ ...prev, ...s }))
    })
  }, [])

  const handleSave = async () => {
    await window.clipAPI.saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const openConsole = (e) => {
    e.preventDefault()
    // In Electron, links don't open by default — the main process would need shell.openExternal
    // For now, just show the URL
    window.clipAPI.hideWindow && null
  }

  return (
    <div className="settings">
      <div className="settings-header">
        <h2>Settings</h2>
        <button className="icon-btn" onClick={onClose} title="Close">
          ✕
        </button>
      </div>

      <div className="settings-section">
        <h3>AI Search</h3>
        <p className="settings-desc">
          Enable semantic AI search by adding your Anthropic API key. Uses claude-haiku (fast &amp; cheap).
        </p>
        <label htmlFor="apikey">Anthropic API Key</label>
        <input
          id="apikey"
          type="password"
          placeholder="sk-ant-api03-..."
          value={settings.anthropicApiKey}
          onChange={(e) =>
            setSettings((s) => ({ ...s, anthropicApiKey: e.target.value }))
          }
          autoComplete="off"
        />
        <p className="settings-desc">
          Get a key at{' '}
          <button className="settings-link" onClick={openConsole}>
            console.anthropic.com
          </button>
        </p>
      </div>

      <div className="settings-section">
        <h3>Storage</h3>
        <label htmlFor="maxitems">Max clipboard items (unpinned)</label>
        <input
          id="maxitems"
          type="number"
          value={settings.maxItems}
          onChange={(e) =>
            setSettings((s) => ({ ...s, maxItems: parseInt(e.target.value) || 1000 }))
          }
          min={50}
          max={10000}
        />
      </div>

      <div className="settings-section">
        <h3>Hotkey</h3>
        <p className="settings-desc">
          Press <strong>Ctrl+Shift+V</strong> (or <strong>Cmd+Shift+V</strong> on Mac) anywhere to open ClipSmart.
        </p>
      </div>

      <div className="settings-section">
        <h3>About</h3>
        <p className="version-text">ClipSmart v0.1.0 — AI-powered clipboard manager</p>
        <p className="settings-desc">
          All data is stored locally on your machine. Nothing is sent to the cloud unless you use AI search.
        </p>
      </div>

      <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
