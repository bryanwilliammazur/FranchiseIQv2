'use client'

export default function KPICard({ label, value, change, changeDir, sub, accent }: {
  label: string
  value: string
  change?: string | null
  changeDir?: 'up' | 'down'
  sub?: string
  accent?: string
  sparkType?: string
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
          {dir === 'up' ? '↑' : '↓'} {String(change).replace('-', '')}%
          <span style={{ color: 'var(--text3)', fontWeight: 400 }}>vs last period</span>
        </div>
      )}
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{sub}</div>}
    </div>
  )
}
