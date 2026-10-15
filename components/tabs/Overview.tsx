'use client'

import type { Metrics, Fix } from '@/lib/types'
import {
  rateLCP, rateCLS, rateINP, rateTTFB, rateFCP,
  ratingColor, ratingLabel,
} from '@/lib/thresholds'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }

const VITALS = [
  {
    code: 'LCP',
    label: 'Largest Contentful Paint',
    good: 2500,
    poor: 4000,
    unit: 'ms',
    format: (v: number) => `${(v / 1000).toFixed(2)}s`,
    rate: rateLCP,
    get: (m: Metrics) => m.lcp,
  },
  {
    code: 'CLS',
    label: 'Cumulative Layout Shift',
    good: 0.1,
    poor: 0.25,
    unit: '',
    format: (v: number) => v.toFixed(3),
    rate: rateCLS,
    get: (m: Metrics) => m.cls,
  },
  {
    code: 'INP',
    label: 'Interaction to Next Paint',
    good: 200,
    poor: 500,
    unit: 'ms',
    format: (v: number) => `${Math.round(v)}ms`,
    rate: rateINP,
    get: (m: Metrics) => m.inp,
  },
  {
    code: 'TTFB',
    label: 'Time to First Byte',
    good: 800,
    poor: 1800,
    unit: 'ms',
    format: (v: number) => `${Math.round(v)}ms`,
    rate: rateTTFB,
    get: (m: Metrics) => m.ttfb,
  },
  {
    code: 'FCP',
    label: 'First Contentful Paint',
    good: 1800,
    poor: 3000,
    unit: 'ms',
    format: (v: number) => `${(v / 1000).toFixed(2)}s`,
    rate: rateFCP,
    get: (m: Metrics) => m.fcp,
  },
]

const IMPACT_COLOR: Record<string, string> = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#22c55e',
}

function VerdictBadge({ metrics }: { metrics: Metrics }) {
  const ratings = VITALS.map(v => v.rate(v.get(metrics)))
  const poorCount = ratings.filter(r => r === 'poor').length
  const niCount = ratings.filter(r => r === 'needs-improvement').length

  let label: string
  let color: string
  let bg: string

  if (poorCount === 0 && niCount === 0) {
    label = 'All Clear'; color = '#22c55e'; bg = 'rgba(34,197,94,.1)'
  } else if (poorCount >= 2) {
    label = 'Critical'; color = '#ef4444'; bg = 'rgba(239,68,68,.1)'
  } else if (poorCount === 1) {
    label = 'Needs Attention'; color = '#f59e0b'; bg = 'rgba(245,158,11,.1)'
  } else {
    label = 'Room to Improve'; color = '#f59e0b'; bg = 'rgba(245,158,11,.08)'
  }

  const goodCount = ratings.filter(r => r === 'good').length

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-[#1e293b]" style={{ background: bg }}>
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        <span className="font-medium text-[15px]" style={{ color }}>{label}</span>
      </div>
      <div className="flex items-center gap-3" style={{ ...MONO, fontSize: 12, color: '#64748b' }}>
        <span><span style={{ color: '#22c55e' }}>{goodCount}</span> good</span>
        <span><span style={{ color: '#f59e0b' }}>{niCount}</span> needs work</span>
        <span><span style={{ color: '#ef4444' }}>{poorCount}</span> poor</span>
      </div>
    </div>
  )
}

function VitalRow({ vital, metrics }: { vital: typeof VITALS[0]; metrics: Metrics }) {
  const value = vital.get(metrics)
  const rating = vital.rate(value)
  const color = ratingColor[rating]
  const pct = rating === 'good'
    ? Math.min((value / vital.poor) * 50, 50)
    : Math.min(50 + ((value - vital.good) / (vital.poor - vital.good)) * 50, 100)

  return (
    <div className="flex flex-col gap-1.5 py-3 border-b border-[#111a2e] last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ ...MONO, fontSize: 12, color: '#a5b4fc' }}>{vital.code}</span>
          <span className="text-[13px] text-[#64748b]">{vital.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ ...MONO, fontSize: 14, color }}>{vital.format(value)}</span>
          <span
            className="text-[11px] px-1.5 py-0.5 rounded"
            style={{ ...MONO, color, background: `${color}18` }}
          >
            {ratingLabel[rating]}
          </span>
        </div>
      </div>
      <div className="h-[4px] rounded-full" style={{ background: '#1e293b', position: 'relative' }}>
        {/* good zone */}
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '50%', background: 'rgba(34,197,94,.25)', borderRadius: '999px 0 0 999px' }} />
        {/* fill */}
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 999,
          transition: 'width 0.6s ease-out',
        }} />
      </div>
    </div>
  )
}

export default function Overview({ metrics, fixes }: { metrics: Metrics; fixes: Fix[] }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', alignItems: 'start' }}
         data-responsive="overview">
      <style>{`@media (max-width: 859px) { [data-responsive="overview"] { grid-template-columns: 1fr !important; } }`}</style>

      {/* Left: Vitals */}
      <div className="flex flex-col gap-4">
        <VerdictBadge metrics={metrics} />
        <div className="rounded-xl border border-[#1e293b] bg-[#060d1a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#f8fafc]">Core Web Vitals</span>
            <span style={{ ...MONO, fontSize: 11, color: '#475569' }}>5 SIGNALS</span>
          </div>
          <div className="px-4">
            {VITALS.map(v => <VitalRow key={v.code} vital={v} metrics={metrics} />)}
          </div>
        </div>
      </div>

      {/* Right: AI Recommendations */}
      <div className="rounded-xl border border-[#1e293b] bg-[#060d1a] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#f8fafc]">AI Recommendations</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ ...MONO, color: '#a5b4fc', background: 'rgba(165,180,252,.12)' }}>AI</span>
        </div>
        <div className="flex flex-col divide-y divide-[#111a2e]">
          {fixes.map((fix, i) => (
            <div key={i} className="px-4 py-3 flex flex-col gap-1">
              <div className="flex items-start gap-2 justify-between">
                <span className="text-[13px] font-medium text-[#f8fafc] leading-snug">{fix.title}</span>
                <span
                  className="flex-shrink-0 text-[11px] px-1.5 py-0.5 rounded"
                  style={{ ...MONO, color: IMPACT_COLOR[fix.impact], background: `${IMPACT_COLOR[fix.impact]}18` }}
                >
                  {fix.impact}
                </span>
              </div>
              <p className="text-[12px] text-[#64748b] leading-relaxed m-0">{fix.detail}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
