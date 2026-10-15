'use client'

import { useEffect, useState } from 'react'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }

const GITHUB_SVG = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

export default function AppHeader({ children }: { children?: React.ReactNode }) {
  const [selfMs, setSelfMs] = useState<number | null>(null)

  useEffect(() => {
    function measure() {
      const nav = performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined
      const ms = nav && (nav.loadEventEnd || nav.domComplete)
      if (ms && ms > 0) setSelfMs(Math.round(ms))
      else setTimeout(measure, 300)
    }
    measure()
  }, [])

  return (
    <header style={{ flexShrink: 0, position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #1e293b', background: '#030712' }}>
      <div style={{ height: 60, maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Brand — pushes everything else to the right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, border: '1.5px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M10 2h4" />
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>PerfLens</span>
        </div>

        {/* Per-screen slot (URL + actions on Dashboard, nothing on Landing/Loading) */}
        {children}

        {/* Self-load pill — desktop only */}
        {selfMs && (
          <span
            className="hidden md:flex"
            title="Measured with the Navigation Timing API"
            style={{ alignItems: 'center', gap: 6, height: 24, padding: '0 10px', border: '1px solid #1e293b', borderRadius: 999, ...MONO, fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
            this page loaded in <span style={{ color: '#f8fafc' }}>{selfMs}ms</span>
          </span>
        )}

        {/* GitHub link — desktop only */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener"
          className="hidden md:flex"
          style={{ alignItems: 'center', height: 32, border: '1px solid #1e293b', borderRadius: 8, color: '#f8fafc', fontSize: 13, overflow: 'hidden', flexShrink: 0, textDecoration: 'none' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#6366f1' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1e293b' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 10px' }}>
            {GITHUB_SVG}
            <span className="hidden lg:inline">perflens</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 10px', borderLeft: '1px solid #1e293b', ...MONO, fontSize: 11, color: '#94a3b8', background: '#0b1220' }}>⎇ main</span>
        </a>

      </div>
    </header>
  )
}
