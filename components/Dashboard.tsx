'use client'

import { useState, useEffect } from 'react'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import type { Metrics, Fix } from '@/lib/types'
import Overview from '@/components/tabs/Overview'
import Timeline from '@/components/tabs/Timeline'
import Recommendations from '@/components/tabs/Recommendations'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }

type Tab = 'overview' | 'timeline' | 'recommendations'

const TABS: { id: Tab; label: string; key: string }[] = [
  { id: 'overview',        label: 'Overview',        key: '1' },
  { id: 'timeline',        label: 'Timeline',        key: '2' },
  { id: 'recommendations', label: 'Recommendations', key: '3' },
]

export default function Dashboard({
  metrics,
  fixes,
  url,
  onReset,
}: {
  metrics: Metrics
  fixes: Fix[]
  url: string
  onReset: () => void
}) {
  const [tab, setTab] = useState<Tab>('overview')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === '1') setTab('overview')
      if (e.key === '2') setTab('timeline')
      if (e.key === '3') setTab('recommendations')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const loadTime = (metrics.waterfall.domComplete / 1000).toFixed(2)

  return (
    <div style={{ background: '#030712', color: '#f8fafc', minHeight: '100vh', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Full-bleed header */}
      <AppHeader>
        <span style={{ ...MONO, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: '#94a3b8' }}>{url}</span>
        <span style={{ ...MONO, fontSize: 13, color: '#f8fafc', flexShrink: 0 }}>{loadTime}s</span>
        <button
          onClick={onReset}
          style={{ flexShrink: 0, height: 32, padding: '0 12px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 8, color: '#f8fafc', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
          onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = '#6366f1'; b.style.background = 'rgba(99,102,241,.08)' }}
          onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = '#1e293b'; b.style.background = 'transparent' }}
        >
          <span className="hidden sm:inline">Try another domain →</span>
          <span className="sm:hidden">New scan →</span>
        </button>
      </AppHeader>

      {/* Tab nav + content — constrained to 1200px */}
      <div style={{ flex: 1, minHeight: 0, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column' }}>

        {/* Tab nav */}
        <nav style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 24, borderBottom: '1px solid #1e293b', marginBottom: 16 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                height: 40, padding: 0, background: 'none', border: 0,
                borderBottom: `2px solid ${tab === t.id ? '#6366f1' : 'transparent'}`,
                marginBottom: -1,
                color: tab === t.id ? '#f8fafc' : '#64748b',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {t.label}
              <span style={{ ...MONO, fontSize: 11, padding: '0 6px', borderRadius: 999, background: '#1e293b', color: '#94a3b8', lineHeight: '18px' }}>{t.key}</span>
            </button>
          ))}
          <span className="hidden md:block" style={{ ...MONO, fontSize: 11, color: '#475569', marginLeft: 'auto' }}>press 1–3</span>
        </nav>

        {/* Content */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {tab === 'overview'        && <Overview        metrics={metrics} fixes={fixes} />}
          {tab === 'timeline'        && <Timeline        metrics={metrics} />}
          {tab === 'recommendations' && <Recommendations fixes={fixes} />}
        </div>

      </div>

      {/* Full-bleed footer */}
      <AppFooter />

    </div>
  )
}
