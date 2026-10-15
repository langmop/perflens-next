'use client'

import { useState } from 'react'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'

const BUDGETS = [
  { code: 'LCP',  t1: '2.5s' },
  { code: 'CLS',  t1: '0.1' },
  { code: 'INP',  t1: '200ms' },
  { code: 'TTFB', t1: '800ms' },
  { code: 'FCP',  t1: '1.8s' },
]

const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }

export default function Landing({
  defaultUrl,
  onSubmit,
}: {
  defaultUrl: string
  onSubmit: (url: string) => void
}) {
  const [url, setUrl] = useState(defaultUrl)
  const [focused, setFocused] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (url.trim()) onSubmit(url.trim())
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      <AppHeader />

      {/* Centred content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 36 }}>

          {/* Idle page clock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ ...MONO, fontSize: 64, fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 1, color: '#334155' }}>
                0.000<span style={{ fontSize: 28 }}>s</span>
              </span>
              <span style={{ ...MONO, fontSize: 11, letterSpacing: '0.08em', color: '#475569' }}>PAGE CLOCK · IDLE</span>
            </div>
            {/* Ruler */}
            <div style={{
              height: 10,
              background: 'repeating-linear-gradient(90deg,#334155 0 1px,transparent 1px 16.66%),repeating-linear-gradient(90deg,#1e293b 0 1px,transparent 1px 3.333%)',
              backgroundSize: '100% 10px,100% 5px',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '0 0,0 5px',
              borderLeft: '1px solid #334155',
              borderRight: '1px solid #334155',
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', ...MONO, fontSize: 10, color: '#475569' }}>
              {['0s','1','2','3','4','5','6s'].map(l => <span key={l}>{l}</span>)}
            </div>
          </div>

          {/* Headline */}
          <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 500, letterSpacing: '-0.025em', color: '#f8fafc' }}>
            Real performance metrics.<br />
            <span style={{ color: '#64748b' }}>No Lighthouse. No guessing.</span>
          </h1>

          {/* Command bar */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              height: 52, padding: '0 6px 0 16px',
              background: '#0f172a',
              border: `1px solid ${focused ? '#6366f1' : '#1e293b'}`,
              borderRadius: 12,
              transition: 'border-color 0.15s',
            }}
          >
            <span style={{ ...MONO, color: '#6366f1', fontSize: 15, flexShrink: 0 }}>›</span>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="https://example.com"
              spellCheck={false}
              style={{ flex: 1, minWidth: 0, height: '100%', background: 'transparent', border: 0, color: '#f8fafc', ...MONO, fontSize: 14, outline: 'none' }}
            />
            <button
              type="submit"
              style={{ height: 40, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, background: '#6366f1', color: '#fff', border: 0, borderRadius: 8, fontWeight: 500, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#4f46e5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#6366f1' }}
            >
              Analyze <span style={{ ...MONO, fontSize: 12, opacity: 0.7 }}>⏎</span>
            </button>
          </form>

          {/* Budgets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(96px,1fr))', gap: 6 }}>
              {BUDGETS.map(b => (
                <div key={b.code} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 10px', border: '1px solid #1e293b', borderRadius: 8 }}>
                  <span style={{ ...MONO, fontSize: 12, color: '#f8fafc' }}>{b.code}</span>
                  <span style={{ ...MONO, fontSize: 11, color: '#64748b' }}>good ≤ {b.t1}</span>
                </div>
              ))}
            </div>
            <span style={{ color: '#64748b', fontSize: 13 }}>Collected via native browser APIs</span>
          </div>

        </div>
      </div>

      <AppFooter />

    </div>
  )
}
