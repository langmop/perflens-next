'use client'

import { useEffect, useRef, useState } from 'react'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import type { Metrics, Fix } from '@/lib/types'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }

type LapState = 'done' | 'active' | 'pending'
type ApiPhase = 'launch' | 'page' | 'ai' | 'complete'

const LAP_DEFS = [
  { code: 'INIT', label: 'Headless browser launched' },
  { code: 'TTFB', label: 'Time to First Byte' },
  { code: 'FCP',  label: 'First Contentful Paint' },
  { code: 'LCP',  label: 'Largest Contentful Paint' },
  { code: 'DOM',  label: 'DOM Interactive' },
  { code: 'CLS',  label: 'Cumulative Layout Shift' },
  { code: 'INP',  label: 'Interaction to Next Paint' },
  { code: 'LOAD', label: 'Load complete' },
  { code: 'AI',   label: 'Generating recommendations' },
]

export default function LoadingScreen({
  url,
  onComplete,
  onError,
}: {
  url: string
  onComplete: (metrics: Metrics, fixes: Fix[]) => void
  onError: (msg: string) => void
}) {
  const [elapsed, setElapsed]   = useState(0)
  const [apiPhase, setApiPhase] = useState<ApiPhase>('launch')
  const [metrics, setMetrics]   = useState<Metrics | null>(null)
  const [fixes, setFixes]       = useState<Fix[] | null>(null)
  const rafRef   = useRef<number>(0)
  const startRef = useRef<number>(0)
  const doneRef  = useRef(false)

  useEffect(() => {
    startRef.current = performance.now()

    const tick = (now: number) => {
      setElapsed(now - startRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    const launchTimer = setTimeout(() => {
      setApiPhase('page')

      async function run() {
        try {
          const runRes = await fetch('/api/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          })
          if (!runRes.ok) {
            const e = await runRes.json()
            throw new Error(e.error || 'Failed to collect metrics')
          }
          const m: Metrics = await runRes.json()
          setMetrics(m)
          setApiPhase('ai')

          let f: Fix[] = []
          try {
            const analyzeRes = await fetch('/api/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url, metrics: m }),
            })
            if (!analyzeRes.ok) throw new Error('AI unavailable')
            const data = await analyzeRes.json()
            f = data.fixes ?? []
          } catch {
            // AI failed — proceed with empty fixes; dashboard shows a notice
            f = [{ title: 'AI recommendations unavailable', detail: 'The AI service encountered an issue. Metrics were collected successfully.', impact: 'Low' }]
          }

          setFixes(f)
          setApiPhase('complete')

          if (!doneRef.current) {
            doneRef.current = true
            setTimeout(() => {
              cancelAnimationFrame(rafRef.current)
              onComplete(m, f)
            }, 700)
          }
        } catch (err: any) {
          cancelAnimationFrame(rafRef.current)
          onError(err.message)
        }
      }

      run()
    }, 900)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(launchTimer)
    }
  }, [url])

  const AXIS = 6000
  const domComplete = metrics?.waterfall.domComplete ?? 5882

  const pageMs = metrics
    ? domComplete
    : apiPhase === 'page'
      ? Math.min(domComplete * Math.pow(Math.min((elapsed - 900) / 14000, 1), 1.7), domComplete * 0.95)
      : 0

  const clockVal  = (pageMs / 1000).toFixed(3)
  const fillPct   = `${Math.min((elapsed / 18000) * 100, 98).toFixed(1)}%`
  const overallPct = `${Math.min(99, Math.round((elapsed / 18000) * 100))}%`

  const phaseLabel =
    apiPhase === 'launch' ? 'LAUNCHING HEADLESS BROWSER' :
    apiPhase === 'page'   ? 'RECORDING PAGE LOAD' :
                            'GENERATING AI RECOMMENDATIONS'

  const rawLaps = LAP_DEFS.map((lap, i) => {
    let isDone = false
    let shown  = '—'
    let valueColor = '#475569'

    if (lap.code === 'INIT') {
      isDone = apiPhase !== 'launch'
      if (isDone) { shown = 'ok'; valueColor = '#22c55e' }
    } else if (lap.code === 'AI') {
      isDone = fixes !== null
      if (isDone) { shown = 'ok'; valueColor = '#22c55e' }
    } else if (metrics) {
      isDone = true
      const w = metrics.waterfall
      const map: Record<string, string> = {
        TTFB: `${Math.round(metrics.ttfb)}ms`,
        FCP:  `${Math.round(metrics.fcp)}ms`,
        LCP:  `${Math.round(metrics.lcp)}ms`,
        DOM:  `${Math.round(w.domInteractive)}ms`,
        CLS:  metrics.cls.toFixed(3),
        INP:  `${Math.round(metrics.inp)}ms`,
        LOAD: `${Math.round(w.domComplete)}ms`,
      }
      shown = map[lap.code] ?? 'ok'
      valueColor = '#22c55e'
    }

    return {
      ...lap,
      n: String(i + 1).padStart(2, '0'),
      isDone,
      state: 'pending' as LapState,
      shown,
      valueColor,
    }
  })

  let activeSet = false
  const laps = rawLaps.map(l => {
    if (!l.isDone && !activeSet) { activeSet = true; return { ...l, state: 'active' as LapState } }
    return l
  })

  const liveMilestones = metrics ? [
    { text: `TTFB ${Math.round(metrics.ttfb)}ms`,                    at: metrics.ttfb,                    row: 0, color: '#22c55e', right: false },
    { text: `FCP ${Math.round(metrics.fcp)}ms`,                      at: metrics.fcp,                     row: 1, color: '#22c55e', right: false },
    { text: `LCP ${Math.round(metrics.lcp)}ms`,                      at: metrics.lcp,                     row: 2, color: '#22c55e', right: false },
    { text: `DOM ${Math.round(metrics.waterfall.domInteractive)}ms`,  at: metrics.waterfall.domInteractive, row: 3, color: '#94a3b8', right: false },
    { text: `Load ${Math.round(metrics.waterfall.domComplete)}ms`,    at: metrics.waterfall.domComplete,   row: 0, color: '#94a3b8', right: true  },
  ] : []

  const pct = (ms: number) => `${Math.min((ms / AXIS) * 100, 100).toFixed(2)}%`

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      <AppHeader />

      {/* Centred content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* URL + % */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ ...MONO, fontSize: 13, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
            <span style={{ ...MONO, fontSize: 12, color: '#64748b', flexShrink: 0 }}>{overallPct}</span>
          </div>

          {/* Phase kicker + clock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ ...MONO, fontSize: 11, letterSpacing: '0.08em', color: '#64748b' }}>{phaseLabel}</span>
            <span style={{ ...MONO, fontSize: 72, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {clockVal}<span style={{ fontSize: 32, color: '#64748b' }}>s</span>
            </span>
          </div>

          {/* Timeline track */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ position: 'relative', paddingTop: 92 }}>
              {liveMilestones.map((m, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  left:   m.right ? undefined : pct(m.at),
                  right:  m.right ? `${(100 - parseFloat(pct(m.at))).toFixed(2)}%` : undefined,
                  top:    `${m.row * 22}px`,
                  bottom: 0,
                  borderLeft:  m.right ? 'none' : `1px solid ${m.color}88`,
                  borderRight: m.right ? `1px solid ${m.color}88` : 'none',
                  zIndex: 2,
                  padding: '0 6px',
                  ...MONO, fontSize: 11, lineHeight: '18px',
                  whiteSpace: 'nowrap',
                  color: m.color,
                  textAlign: m.right ? 'right' : 'left',
                }}>
                  {m.text}
                </div>
              ))}
              <div style={{ position: 'relative', height: 28, background: '#0b1220', border: '1px solid #1e293b', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: fillPct, background: 'rgba(99,102,241,.25)' }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: fillPct, width: 2, background: '#a5b4fc', transform: 'translateX(-1px)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', ...MONO, fontSize: 10, color: '#475569' }}>
              {['0s','1','2','3','4','5','6s'].map(l => <span key={l}>{l}</span>)}
            </div>
          </div>

          {/* Lap list */}
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #1e293b' }}>
            {laps.map(lap => (
              <div
                key={lap.code}
                style={{ display: 'grid', gridTemplateColumns: '16px 26px 48px minmax(0,1fr) auto', alignItems: 'center', gap: 10, height: 36, borderBottom: '1px solid #111a2e' }}
              >
                {lap.state === 'done'    && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', justifySelf: 'center' }} />}
                {lap.state === 'active'  && <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #f59e0b', borderTopColor: 'transparent', justifySelf: 'center', animation: 'pl-spin 0.8s linear infinite' }} />}
                {lap.state === 'pending' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#334155', justifySelf: 'center' }} />}
                <span style={{ ...MONO, fontSize: 11, color: '#475569' }}>{lap.n}</span>
                <span style={{ ...MONO, fontSize: 12, color: lap.isDone || lap.state === 'active' ? '#a5b4fc' : '#475569' }}>{lap.code}</span>
                <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: lap.isDone || lap.state === 'active' ? '#f8fafc' : '#64748b' }}>{lap.label}</span>
                <span style={{ ...MONO, fontSize: 13, textAlign: 'right', color: lap.state === 'active' ? '#475569' : lap.valueColor }}>
                  {lap.state === 'active' ? 'waiting…' : lap.shown}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      <AppFooter />

    </div>
  )
}
