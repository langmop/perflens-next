import { render, screen, waitFor } from '@testing-library/react'
import LoadingScreen from '@/components/LoadingScreen'

const MOCK_METRICS = {
  lcp: 2500, cls: 0.05, inp: 150, fcp: 1200, ttfb: 400,
  waterfall: { dns: 10, tcp: 30, tls: 20, ttfb: 400, download: 200, domInteractive: 1800, domComplete: 2500 },
}

const MOCK_FIXES = [
  { title: 'Fix LCP', detail: 'Use a CDN for static assets.', impact: 'High' as const },
]

// Suppress act() warnings from the RAF clock loop — expected in this context
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  jest.restoreAllMocks()
})

describe('LoadingScreen', () => {
  it('displays the URL being analyzed', () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => MOCK_METRICS })
    render(<LoadingScreen url="https://hunter.io" onComplete={jest.fn()} onError={jest.fn()} />)
    expect(screen.getByText(/hunter\.io/)).toBeInTheDocument()
  })

  it('shows lap codes in the checklist', () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => MOCK_METRICS })
    render(<LoadingScreen url="https://hunter.io" onComplete={jest.fn()} onError={jest.fn()} />)
    expect(screen.getByText('TTFB')).toBeInTheDocument()
    expect(screen.getByText('LCP')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('calls onComplete with metrics when both APIs succeed', async () => {
    const onComplete = jest.fn()
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_METRICS })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ fixes: MOCK_FIXES }) })

    render(<LoadingScreen url="https://hunter.io" onComplete={onComplete} onError={jest.fn()} />)

    await waitFor(() => expect(onComplete).toHaveBeenCalledWith(MOCK_METRICS, MOCK_FIXES), { timeout: 4000 })
  }, 6000)

  it('calls onComplete (not onError) when AI fails — shows metrics with fallback fix', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_METRICS })   // /api/run succeeds
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'AI down' }) }) // /api/analyze fails

    render(<LoadingScreen url="https://hunter.io" onComplete={onComplete} onError={onError} />)

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1), { timeout: 4000 })
    expect(onError).not.toHaveBeenCalled()

    const [passedMetrics, passedFixes] = onComplete.mock.calls[0]
    expect(passedMetrics).toEqual(MOCK_METRICS)
    expect(passedFixes[0].title).toMatch(/unavailable/i)
  }, 6000)

  it('calls onComplete when AI throws a network error', async () => {
    const onComplete = jest.fn()
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_METRICS })
      .mockRejectedValueOnce(new Error('network error'))

    render(<LoadingScreen url="https://hunter.io" onComplete={onComplete} onError={jest.fn()} />)

    await waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 4000 })
  }, 6000)

  it('calls onError when metrics collection fails', async () => {
    const onError = jest.fn()
    const onComplete = jest.fn()
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Browser crashed' }) })

    render(<LoadingScreen url="https://hunter.io" onComplete={onComplete} onError={onError} />)

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Browser crashed'), { timeout: 4000 })
    expect(onComplete).not.toHaveBeenCalled()
  }, 6000)
})
