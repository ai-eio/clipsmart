import React, { useState, useEffect } from 'react'

export default function Settings({ onClose }) {
  const [settings, setSettings] = useState({
    aiProvider: 'local',
    localLLMUrl: 'http://localhost:11434',
    localLLMModel: 'llama3.2',
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

  const isLocal = settings.aiProvider !== 'anthropic'

  return (
    <div className="settings">
      <div className="settings-header">
        <h2>Settings</h2>
        <button className="icon-btn" onClick={onClose} title="Close">
          ✕
        </button>
      </div>

      <div className="settings-section">
        <h3>AI Search Provider</h3>
        <div className="provider-toggle">
          <button
            className={`provider-btn ${isLocal ? 'active' : ''}`}
            onClick={() => setSettings((s) => ({ ...s, aiProvider: 'local' }))}
          >
            Local LLM
          </button>
          <button
            className={`provider-btn ${!isLocal ? 'active' : ''}`}
            onClick={() => setSettings((s) => ({ ...s, aiProvider: 'anthropic' }))}
          >
            Anthropic
          </button>
        </div>
      </div>

      {isLocal ? (
        <div className="settings-section">
          <h3>Local LLM (Ollama)</h3>
          <p className="settings-desc">
            Runs AI search entirely on your machine. Requires{' '}
            <span className="settings-link">Ollama</span> running locally.
          </p>
          <label htmlFor="llmurl">Ollama URL</label>
          <input
            id="llmurl"
            type="text"
            placeholder="http://localhost:11434"
            value={settings.localLLMUrl}
            onChange={(e) => setSettings((s) => ({ ...s, localLLMUrl: e.target.value }))}
            autoComplete="off"
          />
          <label htmlFor="llmmodel" style={{ marginTop: 8 }}>Model</label>
          <input
            id="llmmodel"
            type="text"
            placeholder="llama3.2"
            value={settings.localLLMModel}
            onChange={(e) => setSettings((s) => ({ ...s, localLLMModel: e.target.value }))}
            autoComplete="off"
          />
          <p className="settings-desc" style={{ marginTop: 6 }}>
            Any model pulled in Ollama works. Recommended: <code>llama3.2</code>, <code>mistral</code>, <code>phi3</code>
          </p>
        </div>
      ) : (
        <div className="settings-section">
          <h3>Anthropic API</h3>
          <p className="settings-desc">
            Uses Claude Haiku for fast, accurate results. Requires an API key.
          </p>
          <label htmlFor="apikey">API Key</label>
          <input
            id="apikey"
            type="password"
            placeholder="sk-ant-api03-..."
            value={settings.anthropicApiKey}
            onChange={(e) => setSettings((s) => ({ ...s, anthropicApiKey: e.target.value }))}
            autoComplete="off"
          />
          <p className="settings-desc">Get a key at console.anthropic.com</p>
        </div>
      )}

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
          All data is stored locally. Local LLM mode never sends data anywhere.
        </p>
      </div>

      <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
