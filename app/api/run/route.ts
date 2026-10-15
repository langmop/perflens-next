import { NextRequest, NextResponse } from 'next/server'
import { metricsScript } from '@/lib/metricsScript'

export const maxDuration = 60

async function launchBrowser() {
  if (process.env.NODE_ENV === 'production') {
    const chromium = (await import('@sparticuz/chromium')).default
    const puppeteer = (await import('puppeteer-core')).default
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v153.0.0/chromium-v153.0.0-pack.tar'
      ),
      headless: true,
    })
  }
  // Local dev — use full puppeteer with bundled Chromium
  const puppeteer = (await import('puppeteer')).default
  return puppeteer.launch({ headless: true })
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  let browser
  try {
    browser = await launchBrowser()

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    // Inject metrics collectors before any page script runs
    await page.evaluateOnNewDocument(metricsScript)

    await page.goto(url, { waitUntil: 'load', timeout: 30000 })

    // Wait for our script to signal completion
    await page.waitForFunction('window.__perfDone === true', { timeout: 12000 })

    const metrics = await page.evaluate(() => (window as any).__perfMetrics)

    return NextResponse.json(metrics)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  } finally {
    if (browser) await browser.close()
  }
}
