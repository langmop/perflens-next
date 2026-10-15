const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }

export default function AppFooter() {
  return (
    <footer style={{ flexShrink: 0, position: 'sticky', bottom: 0, zIndex: 50, borderTop: '1px solid #1e293b', background: '#030712' }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap',
        fontSize: 12, color: '#64748b',
      }}>
        <span>Made by <span style={{ color: '#f8fafc' }}>Gaurav Mishra</span></span>
        <span style={{ ...MONO, fontSize: 11, color: '#475569' }}>PerfLens · 2026</span>
      </div>
    </footer>
  )
}
