'use client'

export default function Ticker({ portfolio, kpi }: { portfolio: any[]; kpi: any }) {
  const items = [
    ...portfolio.map(b => ({
      label: b.brand_name,
      value: `$${(Number(b.total_revenue) / 1_000_000).toFixed(1)}M`,
      up: true,
    })),
    {
      label: 'Food Cost %',
      value: `${Number(kpi.avg_food_cost_pct).toFixed(1)}%`,
      up: Number(kpi.avg_food_cost_pct) < 32,
    },
    {
      label: 'Labor %',
      value: `${Number(kpi.avg_labor_pct).toFixed(1)}%`,
      up: Number(kpi.avg_labor_pct) < 30,
    },
    { label: 'Avg Check',    value: `$${Number(kpi.avg_check).toFixed(2)}`, up: true },
    { label: 'Active Stores', value: `${kpi.active_locations}`,             up: true },
  ]

  // Duplicate for seamless loop
  const doubled = [...items, ...items]

  return (
    <div className="flex items-center overflow-hidden flex-shrink-0"
      style={{
        height: 34,
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)',
      }}>
      <div className="flex-shrink-0 flex items-center px-3 h-full font-mono text-[9px] tracking-widest"
        style={{ background: 'var(--accent)', color: 'var(--bg)', textTransform: 'uppercase' }}>
        LIVE
      </div>
      <div className="flex overflow-hidden">
        <div className="flex animate-ticker" style={{ whiteSpace: 'nowrap' }}>
          {doubled.map((item, i) => (
            <span key={i}
              className="inline-flex items-center gap-1 px-6 font-mono text-[11px]"
              style={{ borderRight: '1px solid var(--border)', color: 'var(--text2)' }}>
              {item.label}:&nbsp;
              <span style={{ fontWeight: 500, color: item.up ? 'var(--green)' : 'var(--red)' }}>
                {item.value}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
