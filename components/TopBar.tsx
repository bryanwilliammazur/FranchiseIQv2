'use client'
import { useState } from 'react'

const RANGES = ['1D', '7D', '30D', 'QTD', 'YTD']

export default function TopBar({ title, breadcrumb, alertCount }: {
  title: string
  breadcrumb: string
  alertCount?: number
}) {
  const [activeRange, setActiveRange] = useState('30D')

  return (
    <div className="flex items-center px-7 border-b flex-shrink-0"
      style={{
        height: 60,
        borderColor: 'var(--border)',
        background: 'rgba(8,12,20,0.8)',
        backdropFilter: 'blur(10px)',
      }}>
      <div>
        <div className="font-syne font-bold text-lg tracking-tight">{title}</div>
        <div className="font-mono text-[10px]" style={{ color: 'var(--text3)' }}>
          FranchiseIQ › {breadcrumb}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex rounded-lg overflow-hidden border text-[11px] font-mono"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          {RANGES.map(r => (
            <button key={r}
              onClick={() => setActiveRange(r)}
              className="px-3 py-1.5 transition-colors"
              style={{
                background: activeRange === r ? 'var(--accent)' : 'transparent',
                color:      activeRange === r ? '#fff' : 'var(--text3)',
              }}>
              {r}
            </button>
          ))}
        </div>

        <button className="w-8 h-8 rounded-lg flex items-center justify-center relative"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          🔔
          {alertCount && alertCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: 'var(--red)', border: '1.5px solid var(--bg)' }} />
          )}
        </button>

        <button className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          ⚙️
        </button>

        <button className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          👤
        </button>
      </div>
    </div>
  )
}
