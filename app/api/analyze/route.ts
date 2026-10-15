import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Metrics } from '@/lib/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  const { url, metrics }: { url: string; metrics: Metrics } = await req.json()

  const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' })

  const result = await model.generateContent(buildPrompt(url, metrics))
  const text = result.response.text()

  // Strip markdown code fences if Gemini wraps the JSON
  const clean = text.replace(/```json\n?|\n?```/g, '').trim()

  try {
    const fixes = JSON.parse(clean)
    return NextResponse.json({ fixes })
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: clean }, { status: 500 })
  }
}

function buildPrompt(url: string, metrics: Metrics): string {
  return `You are a web performance expert. Analyze these Core Web Vitals for ${url}:

- LCP: ${Math.round(metrics.lcp)}ms  (Good <2500ms, Poor >4000ms)
- CLS: ${metrics.cls.toFixed(3)}  (Good <0.1, Poor >0.25)
- INP: ${Math.round(metrics.inp)}ms  (Good <200ms, Poor >500ms)
- TTFB: ${Math.round(metrics.ttfb)}ms  (Good <800ms, Poor >1800ms)
- FCP: ${Math.round(metrics.fcp)}ms  (Good <1800ms, Poor >3000ms)

Waterfall breakdown (milliseconds):
${JSON.stringify(metrics.waterfall, null, 2)}

Return ONLY a valid JSON array of exactly 3 fix recommendations. No markdown, no explanation outside the JSON.

[
  { "title": "short title under 8 words", "detail": "2-3 sentences explaining what to fix and the specific impact on the metric", "impact": "High" },
  { "title": "...", "detail": "...", "impact": "Medium" },
  { "title": "...", "detail": "...", "impact": "Low" }
]`
}
