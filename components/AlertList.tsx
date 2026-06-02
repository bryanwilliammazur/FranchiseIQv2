'use client'

const SAMPLE_ALERTS = [
  { severity: 'critical', title: 'Popeyes #0847 — POS offline 2h 14m' },
  { severity: 'critical', title: "Denny's #1204 — Health inspection due in 3 days" },
  { severity: 'warning',  title: 'JIB #0323 — Labor over budget by 4.2%' },
  { severity: 'warning',  title: 'Del Taco #0614 — Beef inventory low (2 days)' },
  { severity: 'info',     title: 'Corner Bakery lease renewal due in 60 days' },
]

export default function AlertList({ alerts }: { alerts: any[] }) {
  const display = alerts.length > 0 ? alerts : SAMPLE_ALERTS

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="font-syne font-bold text-sm">🚨 Active Alerts</span>
        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(255,69,96,0.1)',
            color: 'var(--red)',
            border: '1px solid rgba(255,69,96,0.2)',
          }}>
          {display.length} OPEN
        </span>
      </div>
      <div className="p-3 flex flex-col gap-2">
        {display.slice(0, 6).map((a, i) => (
          <div key={i}
            className="flex items-start gap-2 p-2 rounded-lg text-xs"
            style={{
              background:
                a.severity === 'critical' ? 'rgba(255,69,96,0.06)' :
                a.severity === 'warning'  ? 'rgba(255,184,0,0.06)' :
                'rgba(0,229,255,0.04)',
              border: `1px solid ${
                a.severity === 'critical' ? 'rgba(255,69,96,0.2)' :
                a.severity === 'warning'  ? 'rgba(255,184,0,0.2)' :
                'rgba(0,229,255,0.15)'
              }`,
            }}>
            <span>
              {a.severity === 'critical' ? '🔴' : a.severity === 'warning' ? '🟡' : '🔵'}
            </span>
            <span className="flex-1 leading-relaxed">{a.title ?? a.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
