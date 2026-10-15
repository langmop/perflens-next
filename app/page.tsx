'use client'

import { useState } from 'react'
import Landing from '@/components/Landing'
import LoadingScreen from '@/components/LoadingScreen'
import Dashboard from '@/components/Dashboard'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import type { Metrics, Fix } from '@/lib/types'

type AppState = 'idle' | 'loading' | 'done' | 'error'

export default function Home() {
  const [state, setState] = useState<AppState>('idle')
  const [url, setUrl] = useState('https://hunter.io')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [fixes, setFixes] = useState<Fix[]>([])
  const [error, setError] = useState('')

  function handleAnalyze(submittedUrl: string) {
    setUrl(submittedUrl)
    setState('loading')
  }

  function handleComplete(m: Metrics, f: Fix[]) {
    setMetrics(m)
    setFixes(f)
    setState('done')
  }

  function handleError(msg: string) {
    setError(msg)
    setState('error')
  }

  if (state === 'loading')
    return <LoadingScreen url={url} onComplete={handleComplete} onError={handleError} />
  if (state === 'done')
    return <Dashboard metrics={metrics!} fixes={fixes} url={url} onReset={() => setState('idle')} />
  if (state === 'error')
    return (
      <div style={{ minHeight: '100vh', background: '#030712', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
          <p style={{ color: '#ef4444', fontSize: 14, margin: 0, textAlign: 'center', maxWidth: 480 }}>{error}</p>
          <button
            onClick={() => setState('idle')}
            style={{ color: '#a5b4fc', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Try again
          </button>
        </div>
        <AppFooter />
      </div>
    )
  return <Landing defaultUrl={url} onSubmit={handleAnalyze} />
}
