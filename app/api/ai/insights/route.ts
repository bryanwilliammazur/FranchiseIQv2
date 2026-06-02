import { NextResponse } from 'next/server'
import { generateInsights } from '@/lib/ai'
import { getAIInsights, upsertInsight } from '@/lib/queries'
import { sql } from '@/lib/db'

export async function GET() {
  // Return cached insights from DB
  const insights = await getAIInsights(12)
  return NextResponse.json({ success: true, insights })
}

export async function POST() {
  // Regenerate insights via AI (called by cron or manually)
  try {
    const insights = await generateInsights()

    for (const insight of insights) {
      // Resolve brand_id if brand is mentioned
      let brandId: number | undefined
      if (insight.brand) {
        const rows = await sql`SELECT id FROM brands WHERE slug = ${insight.brand}`
        brandId = (rows[0] as any)?.id
      }

      await upsertInsight({
        insight_type:  insight.insight_type,
        brand_id:      brandId,
        title:         insight.title,
        description:   insight.description,
        impact_amount: insight.impact_amount,
        impact_label:  insight.impact_label,
        priority_score: insight.priority_score,
        action_items:  { items: insight.action_items },
      })
    }

    return NextResponse.json({ success: true, generated: insights.length })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
