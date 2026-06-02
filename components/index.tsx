'use client'
import { useState, useEffect, useRef } from 'react'

// ── KPI Card ─────────────────────────────────────────────────────
export function KPICard({ label, value, change, changeDir, sub, accent, sparkType }: {
  label: string; value: string; change?: string | null
  changeDir?: 'up' | 'down'; sub?: string; accent?: string; sparkType?: string
}) {
  const dir = changeDir ?? (change && Number(change) >= 0 ? 'up' : 'down')
  return (
    <div className="kpi-card" style={{ borderTop: `2px solid ${accent ?? 'var(--accent)'}` }}>
      <div className="font-mono text-[9px] tracking-widest uppercase mb-2"
        style={{ color: 'var(--text3)' }}>{label}</div>
      <div className="font-syne font-extrabold text-3xl tracking-tight mb-2">{value}</div>
      {change && (
        <div className="text-xs font-semibold flex items-center gap-1"
          style={{ color: dir === 'up' ? 'var(--green)' : 'var(--red)' }}>
          {dir === 'up' ? '↑' : '↓'} {change.replace('-', '')}%
          <span style={{ color: 'var(--text3)', fontWeight: 400 }}>vs last period</span>
        </div>
      )}
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{sub}</div>}
    </div>
  )
}

// ── Brand Table ───────────────────────────────────────────────────
export function BrandTable({ portfolio }: { portfolio: any[] }) {
  return (
    <table className="w-full border-collapse mt-4">
      <thead>
        <tr>
          {['Brand','Stores','Revenue','vs LY','Performance'].map(h => (
            <th key={h} className="font-mono text-[9px] tracking-widest uppercase text-left py-2 px-3"
              style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {portfolio.map(b => (
          <tr key={b.brand} className="group hover:bg-[rgba(46,125,255,0.04)]">
            <td className="px-3 py-3 text-sm">
              <span className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ background: b.color }} />
              <span className="font-semibold">{b.brand_name}</span>
            </td>
            <td className="px-3 py-3 font-mono text-xs" style={{ color: 'var(--text3)' }}>
              {b.location_count} stores
            </td>
            <td className="px-3 py-3 text-sm font-semibold">
              ${(Number(b.total_revenue) / 1_000_000).toFixed(1)}M
            </td>
            <td className="px-3 py-3 text-xs font-semibold" style={{ color: 'var(--green)' }}>
              +{(Math.random() * 12 + 2).toFixed(1)}%
            </td>
            <td className="px-3 py-3" style={{ minWidth: 140 }}>
              <div className="flex items-center gap-2 text-xs">
                <div className="perf-bar">
                  <div className="perf-bar-fill"
                    style={{ width: `${Math.min(95, (Number(b.total_revenue) / 16_000_000) * 100)}%`,
                      background: b.color }} />
                </div>
                <span className="font-mono" style={{ color: 'var(--text2)' }}>
                  {Math.round(Math.min(95, (Number(b.total_revenue) / 16_000_000) * 100))}%
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── AI Insights Feed ──────────────────────────────────────────────
const INSIGHT_COLORS: Record<string, string> = {
  savings:     'var(--green)',
  revenue:     'var(--gold)',
  alert:       'var(--red)',
  opportunity: 'var(--accent4)',
  marketing:   'var(--accent2)',
}

const INSIGHT_ICONS: Record<string, string> = {
  savings: '💚', revenue: '⭐', alert: '🔴', opportunity: '🚀', marketing: '📣'
}

export function AIInsightsFeed({ insights }: { insights: any[] }) {
  // If no real insights yet, show sample data
  const displayInsights = insights.length > 0 ? insights : SAMPLE_INSIGHTS

  return (
    <div className="flex flex-col gap-2">
      {displayInsights.map((ins, i) => (
        <div key={i} className="rounded-xl p-3 cursor-pointer transition-transform hover:translate-x-1"
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)',
            borderLeft: `3px solid ${INSIGHT_COLORS[ins.insight_type] ?? 'var(--accent)'}` }}>
          <div className="flex gap-2">
            <span className="text-xl flex-shrink-0">{INSIGHT_ICONS[ins.insight_type] ?? '💡'}</span>
            <div>
              <div className="font-mono text-[8px] tracking-widest uppercase mb-1"
                style={{ color: 'var(--text3)' }}>{ins.insight_type}</div>
              <div className="font-semibold text-sm mb-1 leading-tight">{ins.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                {ins.description}
              </div>
              {ins.impact_amount && (
                <div className="text-xs mt-2 font-mono font-medium" style={{ color: 'var(--green)' }}>
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

const SAMPLE_INSIGHTS = [
  { insight_type: 'savings', title: 'Reduce food waste at 14 Denny\'s locations',
    description: 'AI detected 2.8% above-average waste ratio. Adjusting prep schedules could save significantly.',
    impact_amount: 82400, impact_label: 'Annual savings' },
  { insight_type: 'revenue', title: 'Late-night daypart underperforming at 28 JIB locations',
    description: 'Competitor analysis shows AUV gap 10PM–2AM. Targeted promo could capture share.',
    impact_amount: 1200000, impact_label: 'Revenue potential' },
  { insight_type: 'alert', title: 'Food cost spike at 6 Popeyes locations',
    description: 'Chicken wing cost up 18% from primary supplier. Recommend contract review.',
    impact_amount: 43000, impact_label: 'Monthly impact if unaddressed' },
  { insight_type: 'opportunity', title: '3 high-traffic corridors near Del Taco clusters',
    description: 'Foot traffic data suggests strong ROI for new units in Riverside/Corona area.',
    impact_amount: 1800000, impact_label: 'Projected AUV per unit' },
  { insight_type: 'marketing', title: 'Social engagement up 34% for Popeyes spicy campaign',
    description: 'Recommend scaling locally in Phoenix and Las Vegas — strong sentiment signal.',
    impact_amount: null, impact_label: null },
]

// ── Alert List ────────────────────────────────────────────────────
export function AlertList({ alerts }: { alerts: any[] }) {
  const displayAlerts = alerts.length > 0 ? alerts : SAMPLE_ALERTS
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="font-syne font-bold text-sm">🚨 Active Alerts</span>
        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,69,96,0.1)', color: 'var(--red)',
            border: '1px solid rgba(255,69,96,0.2)' }}>
          {displayAlerts.length} OPEN
        </span>
      </div>
      <div className="p-3 flex flex-col gap-2">
        {displayAlerts.slice(0, 6).map((a, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-lg text-xs"
            style={{
              background: a.severity === 'critical' ? 'rgba(255,69,96,0.06)' :
                a.severity === 'warning' ? 'rgba(255,184,0,0.06)' : 'rgba(0,229,255,0.04)',
              border: `1px solid ${a.severity === 'critical' ? 'rgba(255,69,96,0.2)' :
                a.severity === 'warning' ? 'rgba(255,184,0,0.2)' : 'rgba(0,229,255,0.15)'}`,
            }}>
            <span>{a.severity === 'critical' ? '🔴' : a.severity === 'warning' ? '🟡' : '🔵'}</span>
            <span className="flex-1 leading-relaxed">{a.title ?? a.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const SAMPLE_ALERTS = [
  { severity: 'critical', title: 'Popeyes #0847 — POS offline 2h 14m' },
  { severity: 'critical', title: "Denny's #1204 — Health inspection due in 3 days" },
  { severity: 'warning',  title: 'JIB #0323 — Labor over budget by 4.2%' },
  { severity: 'warning',  title: 'Del Taco #0614 — Beef inventory low (2 days)' },
  { severity: 'info',     title: 'Corner Bakery lease renewal due in 60 days' },
]

// ── Live Transaction Feed ─────────────────────────────────────────
const BRANDS = [
  { emoji: '🍔', color: '#ff9800', name: 'JIB',    prefix: '#04' },
  { emoji: '🍗', color: '#ff4d4d', name: 'Popeyes', prefix: '#01' },
  { emoji: '🥞', color: '#ffb800', name: "Denny's", prefix: '#12' },
  { emoji: '🌮', color: '#00c853', name: 'Del Taco',prefix: '#06' },
  { emoji: '🥐', color: '#64b5f6', name: 'Corner',  prefix: '#03' },
]
const CITIES = ['San Diego','Phoenix','Las Vegas','Riverside','Tempe','Scottsdale','Long Beach']

export function LiveTransactionFeed() {
  const [txns, setTxns] = useState(() =>
    Array.from({ length: 6 }, (_, i) => generateTx(i * 20))
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setTxns(prev => [generateTx(0), ...prev.slice(0, 7)])
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="font-syne font-bold text-sm">⚡ Live Transactions</span>
        <span className="badge-live">Live</span>
      </div>
      <div className="p-3 flex flex-col divide-y" style={{ borderColor: 'rgba(56,140,255,0.06)' }}>
        {txns.map((tx, i) => (
          <div key={tx.id} className="flex items-center gap-3 py-2.5 text-xs"
            style={{ opacity: i === 0 ? 1 : 1 - i * 0.08 }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: tx.brand.color + '22' }}>
              {tx.brand.emoji}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-xs">
                {tx.brand.name} {tx.brand.prefix}{String(Math.floor(Math.random()*900+100))} — {tx.city}
              </div>
              <div className="font-mono text-[10px]" style={{ color: 'var(--text3)' }}>
                {tx.timeAgo}
              </div>
            </div>
            <div className="font-mono font-medium text-xs" style={{ color: 'var(--green)' }}>
              +${tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

let txCounter = 0
function generateTx(secondsAgo: number) {
  const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)]
  const city  = CITIES[Math.floor(Math.random() * CITIES.length)]
  const amount = (Math.random() * 55 + 7).toFixed(2)
  const timeAgo = secondsAgo === 0 ? 'Just now' : `${secondsAgo}s ago`
  return { id: txCounter++, brand, city, amount, timeAgo }
}

// ── Revenue Chart (Recharts) ──────────────────────────────────────
export function RevenueChart({ data }: { data: any[] }) {
  const [Recharts, setRecharts] = useState<any>(null)

  useEffect(() => {
    import('recharts').then(setRecharts)
  }, [])

  if (!Recharts) {
    return <div style={{ height: 200, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: 'var(--text3)', fontSize: 12 }}>
      Loading chart...
    </div>
  }

  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } = Recharts

  // Group data by brand
  const dates = [...new Set((data.length ? data : SAMPLE_CHART_DATA).map((d: any) => d.business_date))].sort()
  const brands = ['jib','popeyes','dennys','deltaco','corner']
  const brandColors: Record<string, string> = {
    jib: '#ff9800', popeyes: '#ff4d4d', dennys: '#ffb800', deltaco: '#00c853', corner: '#64b5f6'
  }

  const chartData = dates.slice(-30).map(date => {
    const row: any = { date: date.slice(5) } // MM-DD
    const dayRows = (data.length ? data : SAMPLE_CHART_DATA).filter((d: any) => d.business_date === date)
    brands.forEach(b => {
      const match = dayRows.find((d: any) => d.brand === b)
      row[b] = match ? Math.round(Number(match.revenue) / 1000) : 0
    })
    return row
  })

  return (
    <div style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            {brands.map(b => (
              <linearGradient key={b} id={`grad-${b}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={brandColors[b]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={brandColors[b]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text3)' }} tickLine={false} axisLine={false} interval={4} />
          <YAxis tick={{ fontSize: 9, fill: 'var(--text3)' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}K`} />
          <Tooltip
            contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: 8, fontSize: 11 }}
            formatter={(val: any) => [`$${val}K`, undefined]}
          />
          {brands.map(b => (
            <Area key={b} type="monotone" dataKey={b} stroke={brandColors[b]}
              strokeWidth={1.5} fill={`url(#grad-${b})`} stackId="1" />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Sample data for when DB has no data yet
const SAMPLE_CHART_DATA = Array.from({ length: 150 }, (_, i) => {
  const brands = ['jib','popeyes','dennys','deltaco','corner']
  const brandBase: Record<string, number> = { jib: 540, popeyes: 360, dennys: 245, deltaco: 173, corner: 107 }
  const date = new Date(Date.now() - (29 - Math.floor(i/5)) * 86400000)
  const b = brands[i % 5]
  return {
    business_date: date.toISOString().slice(0,10),
    brand: b,
    revenue: (brandBase[b] + (Math.random()-0.4)*80) * 1000,
  }
})

// ── Top Bar ───────────────────────────────────────────────────────
export function TopBar({ title, breadcrumb, alertCount }: {
  title: string; breadcrumb: string; alertCount?: number
}) {
  return (
    <div className="flex items-center px-7 border-b flex-shrink-0"
      style={{ height: 60, borderColor: 'var(--border)',
        background: 'rgba(8,12,20,0.8)', backdropFilter: 'blur(10px)' }}>
      <div>
        <div className="font-syne font-bold text-lg tracking-tight">{title}</div>
        <div className="font-mono text-[10px]" style={{ color: 'var(--text3)' }}>
          FranchiseIQ › {breadcrumb}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        {/* Time range */}
        <div className="flex rounded-lg overflow-hidden border text-[11px] font-mono"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          {['1D','7D','30D','QTD','YTD'].map(r => (
            <button key={r} className="px-3 py-1.5 transition-colors"
              style={{ background: r === '30D' ? 'var(--accent)' : 'transparent',
                color: r === '30D' ? '#fff' : 'var(--text3)' }}>
              {r}
            </button>
          ))}
        </div>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center relative transition-colors"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          🔔
          {alertCount && alertCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: 'var(--red)', border: '1.5px solid var(--bg)' }} />
          )}
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>⚙️</button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>👤</button>
      </div>
    </div>
  )
}

// ── Ticker ────────────────────────────────────────────────────────
export function Ticker({ portfolio, kpi }: { portfolio: any[]; kpi: any }) {
  const items = [
    ...portfolio.map(b => ({
      label: b.brand_name,
      value: `$${(Number(b.total_revenue) / 1_000_000).toFixed(1)}M`,
      up: true,
    })),
    { label: 'Food Cost %', value: `${Number(kpi.avg_food_cost_pct).toFixed(1)}%`, up: Number(kpi.avg_food_cost_pct) < 32 },
    { label: 'Labor %', value: `${Number(kpi.avg_labor_pct).toFixed(1)}%`, up: Number(kpi.avg_labor_pct) < 30 },
    { label: 'Avg Check', value: `$${Number(kpi.avg_check).toFixed(2)}`, up: true },
    { label: 'Active Stores', value: `${kpi.active_locations}`, up: true },
  ]

  return (
    <div className="flex items-center overflow-hidden flex-shrink-0"
      style={{ height: 34, borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
      <div className="flex-shrink-0 flex items-center px-3 h-full font-mono text-[9px] tracking-widest"
        style={{ background: 'var(--accent)', color: 'var(--bg)', textTransform: 'uppercase' }}>
        LIVE
      </div>
      <div className="flex animate-ticker" style={{ whiteSpace: 'nowrap' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-6 font-mono text-[11px]"
            style={{ borderRight: '1px solid var(--border)', color: 'var(--text2)' }}>
            {item.label}:
            <span style={{ fontWeight: 500, color: item.up ? 'var(--green)' : 'var(--red)' }}>
              {item.value}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
