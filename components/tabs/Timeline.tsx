'use client'

import type { Metrics } from '@/lib/types'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }

const SEG_COLORS: Record<string, string> = {
  dns:           '#6366f1',
  tcp:           '#8b5cf6',
  tls:           '#a78bfa',
  ttfb:          '#22c55e',
  download:      '#06b6d4',
  domInteractive:'#f59e0b',
  domComplete:   '#f97316',
}

const SEG_LABELS: Record<string, string> = {
  dns:            'DNS',
  tcp:            'TCP',
  tls:            'TLS',
  ttfb:           'TTFB',
  download:       'Download',
  domInteractive: 'DOM Interactive',
  domComplete:    'DOM Complete',
}

export default function Timeline({ metrics }: { metrics: Metrics }) {
  const w = metrics.waterfall
  const total = w.domComplete
  const pct = (ms: number) => `${((ms / total) * 100).toFixed(2)}%`

  const segments = [
    { key: 'dns',            start: 0,                end: w.dns },
    { key: 'tcp',            start: w.dns,            end: w.dns + w.tcp },
    { key: 'tls',            start: w.dns + w.tcp,    end: w.dns + w.tcp + w.tls },
    { key: 'ttfb',           start: w.dns + w.tcp + w.tls, end: w.dns + w.tcp + w.tls + w.ttfb },
    { key: 'download',       start: w.dns + w.tcp + w.tls + w.ttfb, end: w.dns + w.tcp + w.tls + w.ttfb + w.download },
    { key: 'domInteractive', start: w.dns + w.tcp + w.tls + w.ttfb + w.download, end: w.domInteractive },
    { key: 'domComplete',    start: w.domInteractive, end: w.domComplete },
  ].filter(s => s.end > s.start)

  const milestones = [
    { label: 'TTFB', at: metrics.ttfb, color: '#22c55e' },
    { label: 'FCP',  at: metrics.fcp,  color: '#a5b4fc' },
    { label: 'LCP',  at: metrics.lcp,  color: '#f59e0b' },
  ]

  const breakdown = [
    { label: 'DNS Lookup',      ms: w.dns,            color: SEG_COLORS.dns },
    { label: 'TCP Connection',  ms: w.tcp,            color: SEG_COLORS.tcp },
    { label: 'TLS Handshake',   ms: w.tls,            color: SEG_COLORS.tls },
    { label: 'Time to First Byte', ms: w.ttfb,        color: SEG_COLORS.ttfb },
    { label: 'Content Download', ms: w.download,      color: SEG_COLORS.download },
    { label: 'DOM Interactive', ms: w.domInteractive - (w.dns + w.tcp + w.tls + w.ttfb + w.download), color: SEG_COLORS.domInteractive },
    { label: 'DOM Complete',    ms: w.domComplete - w.domInteractive, color: SEG_COLORS.domComplete },
  ].filter(b => b.ms > 0)

  return (
    <div className="flex flex-col gap-5">

      {/* Timeline card */}
      <div className="rounded-xl border border-[#1e293b] bg-[#060d1a] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#f8fafc]">Load Timeline</span>
          <span style={{ ...MONO, fontSize: 12, color: '#64748b' }}>{Math.round(total)}ms total</span>
        </div>
        <div className="px-4 py-4 flex flex-col gap-4">

          {/* Track with milestones */}
          <div style={{ position: 'relative', paddingTop: 32 }}>
            {milestones.map((m, i) => {
              const left = pct(m.at)
              return (
                <div key={i} style={{
                  position: 'absolute',
                  left,
                  top: 0,
                  bottom: 0,
                  borderLeft: `1px solid ${m.color}99`,
                  paddingLeft: 5,
                  ...MONO, fontSize: 11,
                  color: m.color,
                  whiteSpace: 'nowrap',
                  lineHeight: '18px',
                }}>
                  {m.label} {Math.round(m.at)}ms
                </div>
              )
            })}
            {/* Segment bar */}
            <div style={{ display: 'flex', height: 28, borderRadius: 4, overflow: 'hidden', background: '#0b1220' }}>
              {segments.map(seg => (
                <div
                  key={seg.key}
                  title={`${SEG_LABELS[seg.key]}: ${Math.round(seg.end - seg.start)}ms`}
                  style={{
                    width: pct(seg.end - seg.start),
                    background: SEG_COLORS[seg.key],
                    opacity: 0.85,
                    minWidth: 2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Axis */}
          <div className="flex justify-between" style={{ ...MONO, fontSize: 10, color: '#475569' }}>
            {[0, 0.25, 0.5, 0.75, 1].map(f => (
              <span key={f}>{Math.round(total * f)}ms</span>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {segments.map(seg => (
              <div key={seg.key} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: SEG_COLORS[seg.key] }} />
                <span style={{ ...MONO, fontSize: 11, color: '#94a3b8' }}>
                  {SEG_LABELS[seg.key]} <span style={{ color: '#64748b' }}>{Math.round(seg.end - seg.start)}ms</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown card */}
      <div className="rounded-xl border border-[#1e293b] bg-[#060d1a] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e293b]">
          <span className="text-[13px] font-medium text-[#f8fafc]">Where the time goes</span>
        </div>
        <div className="flex flex-col divide-y divide-[#111a2e]">
          {breakdown.map((b, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center gap-3">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: b.color }} />
              <span className="flex-1 text-[13px] text-[#94a3b8]">{b.label}</span>
              <div className="flex items-center gap-3">
                <div style={{ width: 120, height: 4, background: '#1e293b', borderRadius: 999, position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%',
                    width: `${Math.min((b.ms / total) * 100, 100)}%`,
                    background: b.color,
                    borderRadius: 999,
                  }} />
                </div>
                <span style={{ ...MONO, fontSize: 12, color: '#f8fafc', width: 56, textAlign: 'right' }}>{Math.round(b.ms)}ms</span>
                <span style={{ ...MONO, fontSize: 11, color: '#475569', width: 36, textAlign: 'right' }}>
                  {Math.round((b.ms / total) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
