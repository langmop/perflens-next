import { render, screen } from '@testing-library/react'
import Timeline from '@/components/tabs/Timeline'

const METRICS = {
  lcp: 2500, cls: 0.05, inp: 150, fcp: 1200, ttfb: 400,
  waterfall: { dns: 10, tcp: 30, tls: 20, ttfb: 400, download: 200, domInteractive: 1800, domComplete: 2500 },
}

describe('Timeline tab', () => {
  it('renders the Load Timeline heading', () => {
    render(<Timeline metrics={METRICS} />)
    expect(screen.getByText('Load Timeline')).toBeInTheDocument()
  })

  it('renders the "Where the time goes" breakdown', () => {
    render(<Timeline metrics={METRICS} />)
    expect(screen.getByText('Where the time goes')).toBeInTheDocument()
  })

  it('shows DNS and TCP segment labels', () => {
    render(<Timeline metrics={METRICS} />)
    expect(screen.getByText('DNS')).toBeInTheDocument()
    expect(screen.getByText('TCP')).toBeInTheDocument()
  })

  it('shows TTFB segment label', () => {
    render(<Timeline metrics={METRICS} />)
    expect(screen.getAllByText('TTFB').length).toBeGreaterThan(0)
  })
})
