import React, { forwardRef } from 'react'

const TYPE_ICONS = {
  url: '🔗',
  email: '✉',
  code: '</>',
  phone: '☎',
  text: '¶',
}

const TYPE_LABELS = {
  url: 'URL',
  email: 'email',
  code: 'code',
  phone: 'phone',
  text: null,
}

function formatTime(ts) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 5) return 'just now'
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(ts * 1000).toLocaleDateString()
}

const ClipItem = forwardRef(function ClipItem(
  { clip, selected, onCopy, onDelete, onPin, onMouseEnter },
  ref
) {
  const preview = clip.content.length > 200 ? clip.content.slice(0, 200) + '…' : clip.content
  const label = TYPE_LABELS[clip.type]

  return (
    <div
      ref={ref}
      className={`clip-item ${selected ? 'selected' : ''} ${clip.pinned ? 'pinned' : ''}`}
      onClick={onCopy}
      onMouseEnter={onMouseEnter}
    >
      <div className="clip-row">
        <span className="type-badge" title={clip.type}>
          {TYPE_ICONS[clip.type] || '¶'}
        </span>
        <span className={`clip-text ${clip.type === 'code' ? 'code' : ''}`}>{preview}</span>
      </div>

      <div className="clip-meta">
        <div className="meta-left">
          <span className="clip-time">{formatTime(clip.created_at)}</span>
          {label && <span className="clip-type-label">{label}</span>}
        </div>
        <div className="clip-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`action-btn pin ${clip.pinned ? 'active' : ''}`}
            onClick={onPin}
            title={clip.pinned ? 'Unpin' : 'Pin'}
          >
            {clip.pinned ? '📌' : '○'}
          </button>
          <button className="action-btn delete" onClick={onDelete} title="Delete">
            ✕
          </button>
        </div>
      </div>
    </div>
  )
})

export default ClipItem
