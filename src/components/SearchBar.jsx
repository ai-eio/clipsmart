import React, { useRef, useEffect } from 'react'

export default function SearchBar({ value, onChange, onAiSearch, aiSearching, loading }) {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="search-bar">
      <span className="search-icon">⌕</span>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search clipboard history..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
        autoFocus
        spellCheck={false}
      />
      {value && (
        <button
          className="ai-btn"
          onClick={onAiSearch}
          disabled={aiSearching}
          title="AI semantic search (requires API key)"
        >
          {aiSearching ? '...' : '✦ AI'}
        </button>
      )}
      {loading && <span className="spinner">◌</span>}
    </div>
  )
}
