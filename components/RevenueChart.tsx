'use client'
import { useEffect, useState } from 'react'

const BRAND_COLORS: Record<string, string> = {
  jib:     '#ff9800',
  popeyes: '#ff4d4d',
  dennys:  '#ffb800',
  deltaco: '#00c853',
  corner:  '#64b5f6',
}

const BRANDS = Object.keys(BRAND_COLORS)

// Generate sample chart data when DB has no data yet
function makeSampleData() {
  const rows: any[] = []
  for (let d = 29; d >= 0; d--) {
    const date = new Date(Date.now() - d * 86400000).toISOString().slice(0, 10)
    const base: Record<string, number> = { jib: 540, popeyes: 360, dennys: 245, deltaco: 173, corner: 107 }
    BRANDS.forEach(b => {
      rows.push({ business_date: date, brand: b, revenue: (base[b] + (Math.random() - 0.4) * 80) * 1000 })
    })
  }
  return rows
}

export default function RevenueChart({ data }: { data: any[] }) {
  const [Recharts, setRecharts] = useState<any>(null)

  useEffect(() => {
    import('recharts').then(setRecharts)
  }, [])

  if (!Recharts) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'var(--text3)', fontSize: 12 }}>
        Loading chart...
      </div>
    )
  }

  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } = Recharts
  const source = data.length ? data : makeSampleData()
  const dates  = [...new Set(source.map((d: any) => d.business_date as string))].sort()

  const chartData = dates.map(date => {
    const row: any = { date: date.slice(5) }
    const dayRows  = source.filter((d: any) => d.business_date === date)
    BRANDS.forEach(b => {
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
            {BRANDS.map(b => (
              <linearGradient key={b} id={`g-${b}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={BRAND_COLORS[b]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={BRAND_COLORS[b]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text3)' }}
            tickLine={false} axisLine={false} interval={4} />
          <YAxis tick={{ fontSize: 9, fill: 'var(--text3)' }}
            tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}K`} />
          <Tooltip
            contentStyle={{
              background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: 8, fontSize: 11,
            }}
            formatter={(val: any) => [`$${val}K`, undefined]}
          />
          {BRANDS.map(b => (
            <Area key={b} type="monotone" dataKey={b}
              stroke={BRAND_COLORS[b]} strokeWidth={1.5}
              fill={`url(#g-${b})`} stackId="1" />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
