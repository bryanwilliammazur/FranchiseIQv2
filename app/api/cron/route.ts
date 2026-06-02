import { NextRequest, NextResponse } from 'next/server'
import { runFullSync } from '@/lib/sync'
import { generateInsights } from '@/lib/ai'
import { upsertInsight } from '@/lib/queries'

export const maxDuration = 300 // 5 min max for cron

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel cron or your secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, any> = {}

  // Sync last 2 days of data
  try {
    results.sync = await runFullSync(2)
  } catch (e: any) {
    results.sync = { error: e.message }
  }

  // Regenerate AI insights every hour (only if minute is near 0)
  const minute = new Date().getMinutes()
  if (minute < 16) {
    try {
      const insights = await generateInsights()
      let saved = 0
      for (const insight of insights) {
        await upsertInsight(insight).catch(() => {})
        saved++
      }
      results.insights = { generated: insights.length, saved }
    } catch (e: any) {
      results.insights = { error: e.message }
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    ...results,
  })
}
