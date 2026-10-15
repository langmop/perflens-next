/**
 * @jest-environment node
 */
import { POST } from '@/app/api/analyze/route'
import { NextRequest } from 'next/server'

const MOCK_METRICS = {
  lcp: 2500, cls: 0.05, inp: 150, fcp: 1200, ttfb: 400,
  waterfall: { dns: 10, tcp: 30, tls: 20, ttfb: 400, download: 200, domInteractive: 1800, domComplete: 2500 },
}

const MOCK_FIXES = [
  { title: 'Fix LCP', detail: 'Use a CDN for static assets.', impact: 'High' },
  { title: 'Fix CLS', detail: 'Specify image dimensions.', impact: 'Medium' },
  { title: 'Fix TTFB', detail: 'Enable server-side caching.', impact: 'Low' },
]

// `genAI` is created at module load time: const genAI = new GoogleGenerativeAI(...)
// The mock must return a fully-wired instance from the constructor.
// Use a `let` binding so the closure inside the factory captures the reference
// without TDZ access — the closure is only CALLED after beforeEach assigns it.
let generateContent: jest.Mock

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    // Lazy: closure captures the `generateContent` binding, not its value at factory time.
    getGenerativeModel: () => ({
      generateContent: (...args: unknown[]) => generateContent(...args),
    }),
  })),
}))

beforeEach(() => {
  generateContent = jest.fn().mockResolvedValue({
    response: { text: () => JSON.stringify(MOCK_FIXES) },
  })
})

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/analyze', () => {
  it('returns an array of 3 fix recommendations', async () => {
    const res = await POST(makeRequest({ url: 'https://hunter.io', metrics: MOCK_METRICS }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.fixes)).toBe(true)
    expect(data.fixes).toHaveLength(3)
  })

  it('each fix has title, detail, and impact fields', async () => {
    const res = await POST(makeRequest({ url: 'https://hunter.io', metrics: MOCK_METRICS }))
    const { fixes } = await res.json()
    for (const fix of fixes) {
      expect(fix).toHaveProperty('title')
      expect(fix).toHaveProperty('detail')
      expect(fix).toHaveProperty('impact')
    }
  })

  it('strips markdown code fences from AI response', async () => {
    generateContent = jest.fn().mockResolvedValue({
      response: { text: () => '```json\n' + JSON.stringify(MOCK_FIXES) + '\n```' },
    })
    const res = await POST(makeRequest({ url: 'https://hunter.io', metrics: MOCK_METRICS }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.fixes).toHaveLength(3)
  })

  it('returns 500 when AI response is not valid JSON', async () => {
    generateContent = jest.fn().mockResolvedValue({
      response: { text: () => 'Sorry, I cannot help with that.' },
    })
    const res = await POST(makeRequest({ url: 'https://hunter.io', metrics: MOCK_METRICS }))
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data).toHaveProperty('error')
  })
})
