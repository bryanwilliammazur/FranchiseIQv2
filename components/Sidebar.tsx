'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_SECTIONS = [
  { label: 'Overview', items: [
    { href: '/dashboard',     icon: '◈', label: 'Executive Dashboard', badge: 'LIVE', badgeType: 'live' },
    { href: '/dynamic',       icon: '✦', label: 'Dynamic View',        badge: 'AI',   badgeType: 'ai' },
  ]},
  { label: 'Operations', items: [
    { href: '/sales',         icon: '📊', label: 'Sales & Transactions' },
    { href: '/inventory',     icon: '📦', label: 'Inventory & COGS',    badge: '3', badgeType: 'red' },
    { href: '/expenses',      icon: '💳', label: 'Expenses & Labor' },
    { href: '/locations',     icon: '📍', label: 'Locations & Property' },
  ]},
  { label: 'Intelligence', items: [
    { href: '/ai',            icon: '🧠', label: 'NeMo AI Command',     badge: 'CLAW', badgeType: 'purple' },
    { href: '/opportunities', icon: '💡', label: 'Opportunities',        badge: '12',   badgeType: 'green' },
    { href: '/marketing',     icon: '📣', label: 'Marketing & Campaigns' },
    { href: '/strategies',    icon: '🎯', label: 'Growth Strategies' },
  ]},
  { label: 'System', items: [
    { href: '/integrations',  icon: '🔗', label: 'Data Integrations' },
  ]},
]

const BRANDS = [
  { slug: 'all',     label: 'ALL 300+', cls: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/8' },
  { slug: 'jib',     label: '🍔 JIB',   cls: 'text-orange-400 border-orange-400/30 bg-orange-400/8' },
  { slug: 'popeyes', label: '🍗 Pop',   cls: 'text-red-400 border-red-400/30 bg-red-400/8' },
  { slug: 'dennys',  label: "🥞 Den's", cls: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/8' },
  { slug: 'deltaco', label: '🌮 Del',   cls: 'text-green-400 border-green-400/30 bg-green-400/8' },
  { slug: 'corner',  label: '🥐 CB',    cls: 'text-blue-400 border-blue-400/30 bg-blue-400/8' },
]

function BadgePill({ badge, type }: { badge: string; type?: string }) {
  const styles: Record<string, string> = {
    live:   'bg-green-400/10 text-green-400 border border-green-400/20',
    ai:     'bg-blue-400/10 text-blue-300 border border-blue-400/20',
    red:    'bg-red-400/10 text-red-400 border border-red-400/20',
    green:  'bg-green-400/10 text-green-400 border border-green-400/20',
    purple: 'bg-purple-400/10 text-purple-400 border border-purple-400/20',
  }
  return (
    <span className={`ml-auto font-mono text-[9px] tracking-wide px-2 py-0.5 rounded-full ${styles[type ?? ''] ?? 'bg-blue-400/10 text-blue-300'}`}>
      {badge}
    </span>
  )
}

export default function Sidebar({ activePage }: { activePage?: string }) {
  const pathname = usePathname()
  const [activeBrand, setActiveBrand] = useState('all')

  return (
    <aside className="flex flex-col flex-shrink-0 relative"
      style={{ width: 260, background: 'linear-gradient(180deg,var(--bg2) 0%,var(--bg) 100%)',
        borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="px-6 py-7 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="font-syne font-extrabold text-xl tracking-tight">
          <span className="text-white">Franchise</span>
          <span style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent4))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IQ</span>
        </div>
        <div className="font-mono text-[9px] tracking-[3px] mt-1" style={{ color: 'var(--text3)' }}>
          INTELLIGENCE PLATFORM · v1.0
        </div>
      </div>

      {/* Brand filter */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="font-mono text-[9px] tracking-[2px] uppercase mb-2"
          style={{ color: 'var(--text3)' }}>Brands</div>
        <div className="flex flex-wrap gap-1">
          {BRANDS.map(b => (
            <button key={b.slug}
              onClick={() => setActiveBrand(b.slug)}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all
                ${activeBrand === b.slug ? 'opacity-100 scale-105' : 'opacity-70'} ${b.cls}`}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div className="font-mono text-[9px] tracking-[2px] uppercase px-3 pt-4 pb-1.5"
              style={{ color: 'var(--text3)' }}>
              {section.label}
            </div>
            {section.items.map(item => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}>
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  <span className="text-[13.5px]">{item.label}</span>
                  {item.badge && <BadgePill badge={item.badge} type={item.badgeType} />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* AI Status */}
      <div className="p-5 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full" style={{
            background: 'var(--green)', boxShadow: '0 0 8px var(--green)',
            animation: 'pulse 2s infinite'
          }} />
          <span className="font-mono text-[10px] tracking-wide uppercase" style={{ color: 'var(--green)' }}>
            NeMo Claw Active
          </span>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text3)' }}>
          Analyzing 2M+ transactions · Monitoring 300+ locations · AI insights refreshing
        </p>
      </div>
    </aside>
  )
}
