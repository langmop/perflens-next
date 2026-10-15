import '@testing-library/jest-dom'

// jsdom stub for performance.getEntriesByType (used by AppHeader)
if (typeof window !== 'undefined') Object.defineProperty(window, 'performance', {
  value: {
    now: () => 0,
    getEntriesByType: () => [],
  },
  writable: true,
})

// jsdom stub for requestAnimationFrame / cancelAnimationFrame
if (typeof window !== 'undefined') {
  global.requestAnimationFrame = (cb: FrameRequestCallback) => {
    return setTimeout(() => cb(performance.now()), 16) as unknown as number
  }
  global.cancelAnimationFrame = (id: number) => clearTimeout(id)
}
