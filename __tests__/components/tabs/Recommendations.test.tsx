import { render, screen, fireEvent } from '@testing-library/react'
import Recommendations from '@/components/tabs/Recommendations'

const FIXES = [
  { title: 'Reduce server response time', detail: 'Enable caching headers on your origin server.', impact: 'High' as const },
  { title: 'Preload key requests', detail: 'Use link preload for fonts and hero images.', impact: 'Medium' as const },
  { title: 'Remove unused CSS', detail: 'Defer non-critical stylesheets to reduce render-blocking.', impact: 'Low' as const },
]

describe('Recommendations tab', () => {
  it('renders all fix titles in the list', () => {
    render(<Recommendations fixes={FIXES} />)
    // first item appears in both list + detail panel; use getAllByText
    expect(screen.getAllByText('Reduce server response time').length).toBeGreaterThan(0)
    expect(screen.getByText('Preload key requests')).toBeInTheDocument()
    expect(screen.getByText('Remove unused CSS')).toBeInTheDocument()
  })

  it('shows impact badges', () => {
    render(<Recommendations fixes={FIXES} />)
    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText('MEDIUM')).toBeInTheDocument()
    expect(screen.getByText('LOW')).toBeInTheDocument()
  })

  it('selects first item by default and shows its detail', () => {
    render(<Recommendations fixes={FIXES} />)
    expect(screen.getByText('Enable caching headers on your origin server.')).toBeInTheDocument()
  })

  it('shows detail of clicked fix', () => {
    render(<Recommendations fixes={FIXES} />)
    fireEvent.click(screen.getByText('Remove unused CSS'))
    expect(screen.getByText('Defer non-critical stylesheets to reduce render-blocking.')).toBeInTheDocument()
  })
})
