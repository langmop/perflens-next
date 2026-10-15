export type Rating = 'good' | 'needs-improvement' | 'poor'

export function rateLCP(ms: number): Rating {
  if (ms < 2500) return 'good'
  if (ms < 4000) return 'needs-improvement'
  return 'poor'
}

export function rateCLS(score: number): Rating {
  if (score < 0.1) return 'good'
  if (score < 0.25) return 'needs-improvement'
  return 'poor'
}

export function rateINP(ms: number): Rating {
  if (ms < 200) return 'good'
  if (ms < 500) return 'needs-improvement'
  return 'poor'
}

export function rateTTFB(ms: number): Rating {
  if (ms < 800) return 'good'
  if (ms < 1800) return 'needs-improvement'
  return 'poor'
}

export function rateFCP(ms: number): Rating {
  if (ms < 1800) return 'good'
  if (ms < 3000) return 'needs-improvement'
  return 'poor'
}

export const ratingColor: Record<Rating, string> = {
  'good': '#22c55e',
  'needs-improvement': '#f59e0b',
  'poor': '#ef4444',
}

export const ratingLabel: Record<Rating, string> = {
  'good': 'Good',
  'needs-improvement': 'Needs Work',
  'poor': 'Poor',
}
