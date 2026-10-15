/**
 * @jest-environment node
 */
import { POST } from '@/app/api/run/route'
import { NextRequest } from 'next/server'

const MOCK_METRICS = {
  lcp: 2500, cls: 0.05, inp: 150, fcp: 1200, ttfb: 400,
  waterfall: { dns: 10, tcp: 30, tls: 20, ttfb: 400, download: 200, domInteractive: 1800, domComplete: 2500 },
}

// CJS mock: factory returns module.exports value (no 'default' wrapper).
// Route does: const p = (await import('puppeteer')).default
// Jest wraps CJS exports as: { default: <factory return>, ... }
// So factory must return the object that becomes .default → no 'default' nesting.
jest.mock('puppeteer', () => ({
  launch: jest.fn(),
}))

function getLaunch() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('puppeteer').launch as jest.Mock
}

const mockPage = {
  setViewport: jest.fn().mockResolvedValue(undefined),
  evaluateOnNewDocument: jest.fn().mockResolvedValue(undefined),
  goto: jest.fn().mockResolvedValue(undefined),
  waitForFunction: jest.fn().mockResolvedValue(undefined),
  evaluate: jest.fn().mockResolvedValue(MOCK_METRICS),
}

const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn().mockResolvedValue(undefined),
}

beforeEach(() => {
  jest.clearAllMocks()
  getLaunch().mockResolvedValue(mockBrowser)
  mockPage.evaluate.mockResolvedValue(MOCK_METRICS)
  mockBrowser.newPage.mockResolvedValue(mockPage)
})

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/run', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/run', () => {
  it('returns 400 when url is missing', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/url required/i)
  })

  it('returns metrics JSON on success', async () => {
    const res = await POST(makeRequest({ url: 'https://hunter.io' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('lcp', 2500)
    expect(data).toHaveProperty('ttfb', 400)
    expect(data).toHaveProperty('waterfall')
  })

  it('launches the browser and closes it after collecting metrics', async () => {
    await POST(makeRequest({ url: 'https://hunter.io' }))
    expect(mockBrowser.newPage).toHaveBeenCalled()
    expect(mockBrowser.close).toHaveBeenCalled()
  })

  it('injects the metrics script before navigation', async () => {
    await POST(makeRequest({ url: 'https://hunter.io' }))
    expect(mockPage.evaluateOnNewDocument).toHaveBeenCalled()
    const evalOrder = mockPage.evaluateOnNewDocument.mock.invocationCallOrder[0]
    const gotoOrder = mockPage.goto.mock.invocationCallOrder[0]
    expect(evalOrder).toBeLessThan(gotoOrder)
  })

  it('returns 500 when puppeteer throws', async () => {
    getLaunch().mockRejectedValueOnce(new Error('Chrome not found'))
    const res = await POST(makeRequest({ url: 'https://hunter.io' }))
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toBe('Chrome not found')
  })
})
