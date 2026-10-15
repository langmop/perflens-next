import { render, screen } from '@testing-library/react'
import Overview from '@/components/tabs/Overview'

const METRICS = {
  lcp: 2500, cls: 0.05, inp: 150, fcp: 1200, ttfb: 400,
  waterfall: { dns: 10, tcp: 30, tls: 20, ttfb: 400, download: 200, domInteractive: 1800, domComplete: 2500 },
}
const FIXES = [
  { title: 'Reduce server response time', detail: 'Enable caching headers.', impact: 'High' as const },
]

describe('Overview tab', () => {
  it('renders all five vital codes', () => {
    render(<Overview metrics={METRICS} fixes={FIXES} />)
    expect(screen.getByText('LCP')).toBeInTheDocument()
    expect(screen.getByText('CLS')).toBeInTheDocument()
    expect(screen.getByText('INP')).toBeInTheDocument()
    expect(screen.getByText('TTFB')).toBeInTheDocument()
    expect(screen.getByText('FCP')).toBeInTheDocument()
  })

  it('renders the AI Recommendations heading', () => {
    render(<Overview metrics={METRICS} fixes={FIXES} />)
    expect(screen.getByText('AI Recommendations')).toBeInTheDocument()
  })

  it('shows the first fix title', () => {
    render(<Overview metrics={METRICS} fixes={FIXES} />)
    expect(screen.getByText('Reduce server response time')).toBeInTheDocument()
  })

  it('renders vital values from metrics', () => {
    render(<Overview metrics={METRICS} fixes={FIXES} />)
    // LCP = 2500ms → formatted as 2.50s
    expect(screen.getAllByText('2.50s').length).toBeGreaterThan(0)
  })
})
