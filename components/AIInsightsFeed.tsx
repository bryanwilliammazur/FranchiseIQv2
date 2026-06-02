'use client'

const INSIGHT_COLORS: Record<string, string> = {
  savings:     'var(--green)',
  revenue:     'var(--gold)',
  alert:       'var(--red)',
  opportunity: 'var(--accent4)',
  marketing:   'var(--accent2)',
}

const INSIGHT_ICONS: Record<string, string> = {
  savings: '💚', revenue: '⭐', alert: '🔴', opportunity: '🚀', marketing: '📣',
}

const SAMPLE_INSIGHTS = [
  {
    insight_type: 'savings',
    title: "Reduce food waste at 14 Denny's locations",
    description: 'AI detected 2.8% above-average waste ratio. Adjusting prep schedules could save significantly.',
    impact_amount: 82400,
    impact_label: 'Annual savings',
  },
  {
    insight_type: 'revenue',
    title: 'Late-night daypart underperforming at 28 JIB locations',
    description: 'Competitor analysis shows AUV gap 10PM–2AM. Targeted promo could capture share.',
    impact_amount: 1200000,
    impact_label: 'Revenue potential',
  },
  {
    insight_type: 'alert',
    title: 'Food cost spike at 6 Popeyes locations',
    description: 'Chicken wing cost up 18% from primary supplier. Recommend contract review.',
    impact_amount: 43000,
    impact_label: 'Monthly impact if unaddressed',
  },
  {
    insight_type: 'opportunity',
    title: '3 high-traffic corridors near Del Taco clusters',
    description: 'Foot traffic data suggests strong ROI for new units in Riverside/Corona area.',
    impact_amount: 1800000,
    impact_label: 'Projected AUV per unit',
  },
  {
    insight_type: 'marketing',
    title: 'Social engagement up 34% for Popeyes spicy campaign',
    description: 'Recommend scaling locally in Phoenix and Las Vegas — strong sentiment signal.',
    impact_amount: null,
    impact_label: null,
  },
]

export default function AIInsightsFeed({ insights }: { insights: any[] }) {
  const display = insights.length > 0 ? insights : SAMPLE_INSIGHTS

  return (
    <div className="flex flex-col gap-2">
      {display.map((ins, i) => (
        <div key={i}
          className="rounded-xl p-3 cursor-pointer transition-transform hover:translate-x-1"
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${INSIGHT_COLORS[ins.insight_type] ?? 'var(--accent)'}`,
          }}>
          <div className="flex gap-2">
            <span className="text-xl flex-shrink-0 mt-0.5">
              {INSIGHT_ICONS[ins.insight_type] ?? '💡'}
            </span>
            <div>
              <div className="font-mono text-[8px] tracking-widest uppercase mb-1"
                style={{ color: 'var(--text3)' }}>
                {ins.insight_type}
              </div>
              <div className="font-semibold text-sm mb-1 leading-tight">{ins.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                {ins.description}
              </div>
              {ins.impact_amount && (
                <div className="text-xs mt-2 font-mono font-medium"
                  style={{ color: 'var(--green)' }}>
                  💰 {ins.impact_label}: ${Number(ins.impact_amount).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
