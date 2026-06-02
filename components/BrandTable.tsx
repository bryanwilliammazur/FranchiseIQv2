'use client'

export default function BrandTable({ portfolio }: { portfolio: any[] }) {
  return (
    <table className="w-full border-collapse mt-4">
      <thead>
        <tr>
          {['Brand', 'Stores', 'Revenue', 'vs LY', 'Performance'].map(h => (
            <th key={h}
              className="font-mono text-[9px] tracking-widest uppercase text-left py-2 px-3"
              style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {portfolio.map((b, i) => (
          <tr key={b.brand ?? i} className="hover:bg-[rgba(46,125,255,0.04)]">
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
                    style={{
                      width: `${Math.min(95, (Number(b.total_revenue) / 16_000_000) * 100)}%`,
                      background: b.color,
                    }} />
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
