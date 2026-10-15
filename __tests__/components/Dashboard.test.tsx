import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from '@/components/Dashboard'

const METRICS = {
  lcp: 2500, cls: 0.05, inp: 150, fcp: 1200, ttfb: 400,
  waterfall: { dns: 10, tcp: 30, tls: 20, ttfb: 400, download: 200, domInteractive: 1800, domComplete: 2500 },
}
const FIXES = [
  { title: 'Reduce server response time', detail: 'Enable caching headers.', impact: 'High' as const },
  { title: 'Preload key requests', detail: 'Use link preload for fonts.', impact: 'Medium' as const },
  { title: 'Remove unused CSS', detail: 'Defer non-critical styles.', impact: 'Low' as const },
]

describe('Dashboard', () => {
  it('shows the analyzed URL in the header', () => {
    render(<Dashboard metrics={METRICS} fixes={FIXES} url="https://hunter.io" onReset={jest.fn()} />)
    expect(screen.getByText(/hunter\.io/)).toBeInTheDocument()
  })

  it('shows the load time derived from domComplete', () => {
    render(<Dashboard metrics={METRICS} fixes={FIXES} url="https://hunter.io" onReset={jest.fn()} />)
    // domComplete = 2500ms → 2.50s; may appear in header + overview
    expect(screen.getAllByText('2.50s').length).toBeGreaterThan(0)
  })

  it('"Try another domain" button calls onReset', () => {
    const onReset = jest.fn()
    render(<Dashboard metrics={METRICS} fixes={FIXES} url="https://hunter.io" onReset={onReset} />)
    fireEvent.click(screen.getByText(/try another domain/i))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('renders all three tab labels', () => {
    render(<Dashboard metrics={METRICS} fixes={FIXES} url="https://hunter.io" onReset={jest.fn()} />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Timeline')).toBeInTheDocument()
    expect(screen.getByText('Recommendations')).toBeInTheDocument()
  })

  it('defaults to the Overview tab', () => {
    render(<Dashboard metrics={METRICS} fixes={FIXES} url="https://hunter.io" onReset={jest.fn()} />)
    expect(screen.getByText('AI Recommendations')).toBeInTheDocument()
  })

  it('switches to Timeline tab on click', () => {
    render(<Dashboard metrics={METRICS} fixes={FIXES} url="https://hunter.io" onReset={jest.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /timeline/i }))
    expect(screen.getByText('Load Timeline')).toBeInTheDocument()
  })

  it('switches to Recommendations tab on click', () => {
    render(<Dashboard metrics={METRICS} fixes={FIXES} url="https://hunter.io" onReset={jest.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /recommendations/i }))
    // title appears in both list row and detail panel — just confirm it's present
    expect(screen.getAllByText('Reduce server response time').length).toBeGreaterThan(0)
  })
})
