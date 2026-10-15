export interface Waterfall {
  dns: number
  tcp: number
  tls: number
  ttfb: number
  download: number
  domInteractive: number
  domComplete: number
}

export interface Metrics {
  lcp: number
  cls: number
  inp: number
  fcp: number
  ttfb: number
  waterfall: Waterfall
}

export interface Fix {
  title: string
  detail: string
  impact: 'High' | 'Medium' | 'Low'
}
