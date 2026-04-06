import React, { useRef, useEffect } from 'react'
import ClipItem from './ClipItem'

export default function ClipList({ clips, selectedIndex, onCopy, onDelete, onPin, onSelect }) {
  const selectedRef = useRef(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedIndex])

  if (clips.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">⌨</div>
        <p>No clipboard items yet</p>
        <p className="hint">Start copying text — it will appear here automatically</p>
      </div>
    )
  }

  return (
    <div className="clip-list">
      {clips.map((clip, index) => (
        <ClipItem
          key={clip.id}
          clip={clip}
          selected={index === selectedIndex}
          ref={index === selectedIndex ? selectedRef : null}
          onCopy={() => onCopy(clip.content)}
          onDelete={() => onDelete(clip.id)}
          onPin={() => onPin(clip.id)}
          onMouseEnter={() => onSelect(index)}
        />
      ))}
    </div>
  )
}
