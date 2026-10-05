'use client'
import { useEffect, useRef, useState } from 'react'
import { getPaperAiJobs } from './geminiService'

const STATUS = {
  completed: { color: '#30D158', label: 'completed' },
  failed: { color: '#FF375F', label: 'failed' },
  cancelled: { color: '#FF9F0A', label: 'cancelled' },
  running: { color: '#64D2FF', label: 'running' },
  queued: { color: '#0A84FF', label: 'queued' },
}

function formatJobType(job) {
  if (job?.type === 'pdf_import') return 'PDF import'
  if (job?.type === 'handwritten_scan') return 'Handwritten scan'
  if (job?.type === 'text_import') return 'Text import'
  return 'AI job'
}

function Toast({ toast, onDismiss }) {
  const meta = STATUS[toast.status] || STATUS.queued
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.status === 'running' ? 8000 : 6000)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 12,
        background: 'rgba(7,30,52,0.96)',
        border: `1px solid ${meta.color}44`,
        boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
        minWidth: 280,
        maxWidth: 360,
        animation: 'pgToastIn 220ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, marginTop: 5, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>
          {formatJobType(toast)} {meta.label}
        </div>
        <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
          {toast.message || 'Check Import Review Queue for extracted items.'}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        style={{ background: 'transparent', border: 'none', color: '#8892A4', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}

export default function PaperAiJobToasts() {
  const [toasts, setToasts] = useState([])
  const seenRef = useRef(new Set())

  useEffect(() => {
    let blocked = false
    let timer = null
    const poll = async () => {
      if (blocked) return
      try {
        const data = await getPaperAiJobs(12)
        const jobs = Array.isArray(data?.jobs) ? data.jobs : []
        const fresh = []

        jobs.forEach(job => {
          if (!job?.id) return
          const status = job.status || 'queued'
          const key = `${job.id}:${status}`
          if (seenRef.current.has(key)) return

          if (['completed', 'failed', 'cancelled'].includes(status)) {
            seenRef.current.add(key)
            fresh.push({
              id: `${job.id}-${status}-${Date.now()}`,
              status,
              type: job.type,
              message: status === 'completed'
                ? (job.message || 'Open Import Review Queue to approve extracted questions.')
                : (job.error?.message || job.message || 'Retry from AI Job History if needed.'),
            })
          } else if (status === 'running' && !seenRef.current.has(`${job.id}:running`)) {
            seenRef.current.add(`${job.id}:running`)
            fresh.push({
              id: `${job.id}-running-${Date.now()}`,
              status: 'running',
              type: job.type,
              message: job.message || 'Processing in background…',
            })
          }
        })

        if (fresh.length) {
          setToasts(prev => [...fresh, ...prev].slice(0, 4))
        }
      } catch (error) {
        // A disabled school feature/expired session must not generate a 403
        // every five seconds across a shared school network.
        if ([401,403].includes(Number(error?.response?.status))) {
          blocked = true
          if (timer) clearInterval(timer)
        }
      }
    }

    timer = setInterval(poll, 5000)
    poll()
    return () => {blocked=true;clearInterval(timer)}
  }, [])

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  if (!toasts.length) return null

  return (
    <>
      <style>{`
        @keyframes pgToastIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 13000,
          display: 'grid',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </>
  )
}
