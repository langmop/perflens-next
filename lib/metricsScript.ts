export const metricsScript = `
(function () {
  const m = { lcp: 0, cls: 0, inp: 0, fcp: 0, waterfall: {} }

  new PerformanceObserver(list => {
    m.lcp = list.getEntries().at(-1).startTime
  }).observe({ type: 'largest-contentful-paint', buffered: true })

  new PerformanceObserver(list => {
    list.getEntries().forEach(e => { m.cls += e.value })
  }).observe({ type: 'layout-shift', buffered: true })

  new PerformanceObserver(list => {
    list.getEntries().forEach(e => {
      if (e.duration > m.inp) m.inp = e.duration
    })
  }).observe({ type: 'event', buffered: true, durationThreshold: 16 })

  new PerformanceObserver(list => {
    const fcp = list.getEntries().find(e => e.name === 'first-contentful-paint')
    if (fcp) m.fcp = fcp.startTime
  }).observe({ type: 'paint', buffered: true })

  window.addEventListener('load', () => {
    const nav = performance.getEntriesByType('navigation')[0]
    m.waterfall = {
      dns:            nav.domainLookupEnd  - nav.domainLookupStart,
      tcp:            nav.connectEnd       - nav.connectStart,
      tls:            nav.secureConnectionStart > 0 ? nav.requestStart - nav.secureConnectionStart : 0,
      ttfb:           nav.responseStart    - nav.requestStart,
      download:       nav.responseEnd      - nav.responseStart,
      domInteractive: nav.domInteractive,
      domComplete:    nav.domComplete,
    }
    m.ttfb = nav.responseStart - nav.fetchStart
    setTimeout(() => {
      window.__perfMetrics = m
      window.__perfDone = true
    }, 1000)
  })
})()
`
