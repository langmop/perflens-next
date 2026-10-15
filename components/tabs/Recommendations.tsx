'use client'

import { useState } from 'react'
import type { Fix } from '@/lib/types'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }

const IMPACT_COLOR: Record<string, string> = {
  High:   '#ef4444',
  Medium: '#f59e0b',
  Low:    '#22c55e',
}

const IMPACT_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 }

export default function Recommendations({ fixes }: { fixes: Fix[] }) {
  const sorted = [...fixes].sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact])
  const [selected, setSelected] = useState(0)
  const fix = sorted[selected]

  return (
    <div data-responsive="recs" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
      <style>{`@media (max-width: 859px) { [data-responsive="recs"] { grid-template-columns: 1fr !important; } }`}</style>

      {/* List */}
      <div className="rounded-xl border border-[#1e293b] bg-[#060d1a] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e293b]">
          <span className="text-[13px] font-medium text-[#f8fafc]">Fixes</span>
        </div>
        <div className="flex flex-col">
          {sorted.map((f, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="text-left flex items-start gap-3 px-4 py-3 border-b border-[#111a2e] last:border-0 cursor-pointer transition-colors"
              style={{
                background: selected === i ? 'rgba(99,102,241,.08)' : 'transparent',
                borderRight: selected === i ? '2px solid #6366f1' : '2px solid transparent',
              }}
            >
              <span
                className="flex-shrink-0 mt-0.5 text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{ ...MONO, color: IMPACT_COLOR[f.impact], background: `${IMPACT_COLOR[f.impact]}18` }}
              >
                {f.impact.toUpperCase()}
              </span>
              <span className="text-[13px] text-[#f8fafc] leading-snug">{f.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      {fix && (
        <div className="rounded-xl border border-[#1e293b] bg-[#060d1a] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e293b] flex items-start gap-3 justify-between">
            <h3 className="m-0 text-[15px] font-medium text-[#f8fafc] leading-snug">{fix.title}</h3>
            <span
              className="flex-shrink-0 text-[11px] px-2 py-1 rounded font-medium"
              style={{ ...MONO, color: IMPACT_COLOR[fix.impact], background: `${IMPACT_COLOR[fix.impact]}18` }}
            >
              {fix.impact} Impact
            </span>
          </div>
          <div className="px-5 py-5">
            <p className="m-0 text-[14px] text-[#94a3b8] leading-relaxed">{fix.detail}</p>
          </div>
        </div>
      )}
    </div>
  )
}
