import Anthropic from '@anthropic-ai/sdk'
import {
  getTotalKPIs, getPortfolioSummary, getActiveAlerts,
  getHighLaborLocations, getTopLocations, getBottomLocations,
} from './queries'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// ── Data context builder ──────────────────────────────────────────
// Fetches live data from DB and formats it for the AI prompt

export async function buildDataContext(days = 30): Promise<string> {
  try {
    const [kpis, portfolio, alerts, highLabor, topLocs, bottomLocs] = await Promise.all([
      getTotalKPIs(days),
      getPortfolioSummary(days),
      getActiveAlerts(10),
      getHighLaborLocations(32, 5),
      getTopLocations(5),
      getBottomLocations(5),
    ])

    const kpi = kpis as any

    return `
## LIVE FRANCHISE DATA (Last ${days} days)

### Portfolio KPIs
- Total Revenue: $${Number(kpi.total_revenue).toLocaleString()}
- Total Transactions: ${Number(kpi.total_transactions).toLocaleString()}
- Avg Check: $${Number(kpi.avg_check).toFixed(2)}
- Avg Food Cost %: ${Number(kpi.avg_food_cost_pct).toFixed(1)}%
- Avg Labor %: ${Number(kpi.avg_labor_pct).toFixed(1)}%
- Active Locations: ${kpi.active_locations}
- vs Prior Period: ${kpi.vs_last_period_pct ? kpi.vs_last_period_pct + '%' : 'N/A'}

### By Brand
${(portfolio as any[]).map(b =>
  `- ${b.brand_name}: $${Number(b.total_revenue).toLocaleString()} revenue, ` +
  `${b.location_count} stores, ${Number(b.avg_labor_pct).toFixed(1)}% labor, ` +
  `${Number(b.avg_food_cost_pct).toFixed(1)}% food cost`
).join('\n')}

### Active Alerts (${(alerts as any[]).length} open)
${(alerts as any[]).slice(0, 5).map(a =>
  `- [${a.severity.toUpperCase()}] ${a.title} — ${a.location_name ?? 'Portfolio-wide'}`
).join('\n')}

### Top 5 Locations by Revenue
${(topLocs as any[]).map((l, i) =>
  `${i + 1}. ${l.name} (${l.brand}) — $${Number(l.revenue_30d).toLocaleString()}, ` +
  `${Number(l.avg_labor_pct).toFixed(1)}% labor`
).join('\n')}

### Bottom 5 Locations (need attention)
${(bottomLocs as any[]).map((l, i) =>
  `${i + 1}. ${l.name} (${l.brand}) — $${Number(l.revenue_30d).toLocaleString()}, ` +
  `${Number(l.avg_food_cost_pct).toFixed(1)}% food cost`
).join('\n')}

### High Labor Locations (>${32}%)
${(highLabor as any[]).map(l =>
  `- ${l.name} (${l.brand}): ${Number(l.avg_labor_pct).toFixed(1)}% labor`
).join('\n')}
`.trim()

  } catch (e) {
    console.error('Failed to build data context:', e)
    return 'Live data temporarily unavailable. Responding based on general franchise intelligence.'
  }
}

// ── System prompt ─────────────────────────────────────────────────

function buildSystemPrompt(dataContext: string): string {
  return `You are NeMo Claw, the AI intelligence engine for FranchiseIQ — an advanced business intelligence platform for a large multi-brand restaurant franchisee operating 300+ locations across Jack in the Box, Popeyes, Denny's, Del Taco, and Corner Bakery.

You have real-time access to all franchise data including sales, transactions, labor, food cost, expenses, and market intelligence. You are connected to live data from R365 (accounting/operations), QU POS (transactions), and external market signals.

Your role is to:
1. Answer questions about franchise performance using the live data provided
2. Proactively identify cost savings, revenue opportunities, and operational improvements
3. Generate actionable strategies with specific dollar impact estimates
4. Provide competitive intelligence and local marketing recommendations
5. Detect anomalies and alert to potential issues before they become problems

Always be specific with numbers. Reference actual store data when available. When suggesting opportunities, always include estimated dollar impact. Be direct and actionable — these are business owners who want clear recommendations, not vague advice.

${dataContext}

Respond in a clear, executive-friendly style. Use markdown formatting for structure. Lead with the most important finding.`
}

// ── Streaming chat ────────────────────────────────────────────────

export async function streamChat(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  days = 30
) {
  const dataContext  = await buildDataContext(days)
  const systemPrompt = buildSystemPrompt(dataContext)

  return anthropic.messages.stream({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system:     systemPrompt,
    messages,
  })
}

// ── One-shot AI query (for insights/opportunities generation) ─────

export async function queryAI(prompt: string, days = 30): Promise<string> {
  const dataContext  = await buildDataContext(days)
  const systemPrompt = buildSystemPrompt(dataContext)

  const response = await anthropic.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system:     systemPrompt,
    messages:   [{ role: 'user', content: prompt }],
  })

  return (response.content[0] as any).text ?? ''
}

// ── Generate AI insights (called by cron) ────────────────────────

export async function generateInsights(): Promise<any[]> {
  const prompt = `
Analyze the current franchise data and identify the top 5 most impactful opportunities.
For each opportunity return a JSON array with this exact structure:
[
  {
    "insight_type": "savings|revenue|alert|opportunity|marketing",
    "title": "Short title",
    "description": "2-3 sentence description with specific data points",
    "impact_amount": 123456,
    "impact_label": "Annual savings" or "Annual revenue potential",
    "priority_score": 85,
    "action_items": ["Action 1", "Action 2", "Action 3"]
  }
]
Return ONLY the JSON array, no other text.`

  try {
    const raw     = await queryAI(prompt)
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch (e) {
    console.error('Failed to generate insights:', e)
    return []
  }
}

// ── Dynamic dashboard data generation ────────────────────────────

export async function generateDynamicView(query: string): Promise<any> {
  const dataContext = await buildDataContext(30)

  const prompt = `
The user wants to see: "${query}"

Based on the live franchise data below, generate a JSON response with the most relevant data visualizations.
Return a JSON object with this structure:
{
  "title": "View title",
  "widgets": [
    {
      "type": "metric|bar_chart|list|alert_list",
      "title": "Widget title",
      "data": [...],
      "insight": "One sentence AI insight about this data"
    }
  ]
}

Live data:
${dataContext}

Return ONLY valid JSON, no other text.`

  try {
    const raw     = await queryAI(prompt)
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch (e) {
    return {
      title: query,
      widgets: [{
        type: 'list',
        title: 'AI Analysis',
        data: [],
        insight: 'Unable to generate view. Please try rephrasing your query.',
      }]
    }
  }
}
