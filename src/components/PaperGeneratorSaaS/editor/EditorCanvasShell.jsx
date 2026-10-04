import { useEffect, useRef, useState } from 'react'

const PAGE_WIDTH = 794

export default function EditorCanvasShell({ children, className = '' }) {
  const shellRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 900
      setIsMobile(mobile)
      if (!mobile) {
        setScale(1)
        return
      }
      const pad = 24
      const available = Math.max(280, (shellRef.current?.clientWidth || window.innerWidth) - pad)
      setScale(Math.min(1, Math.max(0.42, available / PAGE_WIDTH)))
    }
    update()
    window.addEventListener('resize', update)
    const vv = window.visualViewport
    vv?.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      vv?.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div
      ref={shellRef}
      className={`pg-editor-canvas-shell ${className}`.trim()}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowX: 'hidden',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {isMobile && scale < 1 && (
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 4,
          width: '100%',
          maxWidth: PAGE_WIDTH,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          padding: '6px 8px',
          marginBottom: 8,
          borderRadius: 10,
          background: 'rgba(7,22,40,0.92)',
          border: '1px solid rgba(148,163,184,0.18)',
          fontSize: 11,
          color: '#8892A4',
        }}
        >
          <span>Pinch or use slider to zoom</span>
          <input
            type="range"
            min={42}
            max={100}
            value={Math.round(scale * 100)}
            onChange={e => setScale(Number(e.target.value) / 100)}
            style={{ width: 120, accentColor: '#C8991A' }}
            aria-label="Zoom"
          />
        </div>
      )}
      <div
        style={{
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          width: PAGE_WIDTH,
          marginBottom: scale < 1 ? `-${Math.round((1 - scale) * 1123 * 0.85)}px` : 0,
        }}
      >
        {children}
      </div>
    </div>
  )
}
