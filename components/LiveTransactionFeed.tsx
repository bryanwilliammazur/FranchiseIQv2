'use client'
import { useState, useEffect } from 'react'

const BRANDS = [
  { emoji: '🍔', color: '#ff9800', name: 'JIB',     prefix: '#04' },
  { emoji: '🍗', color: '#ff4d4d', name: 'Popeyes',  prefix: '#01' },
  { emoji: '🥞', color: '#ffb800', name: "Denny's",  prefix: '#12' },
  { emoji: '🌮', color: '#00c853', name: 'Del Taco', prefix: '#06' },
  { emoji: '🥐', color: '#64b5f6', name: 'Corner',   prefix: '#03' },
]

const CITIES = ['San Diego', 'Phoenix', 'Las Vegas', 'Riverside', 'Tempe', 'Scottsdale', 'Long Beach']

let counter = 0

function makeTx(secondsAgo: number) {
  const brand  = BRANDS[Math.floor(Math.random() * BRANDS.length)]
  const city   = CITIES[Math.floor(Math.random() * CITIES.length)]
  const amount = (Math.random() * 55 + 7).toFixed(2)
  const store  = String(Math.floor(Math.random() * 900 + 100))
  const timeAgo = secondsAgo === 0 ? 'Just now' : `${secondsAgo}s ago`
  return { id: counter++, brand, city, amount, store, timeAgo }
}

export default function LiveTransactionFeed() {
  const [txns, setTxns] = useState(() =>
    Array.from({ length: 6 }, (_, i) => makeTx(i * 20))
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setTxns(prev => [makeTx(0), ...prev.slice(0, 7)])
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="font-syne font-bold text-sm">⚡ Live Transactions</span>
        <span className="badge-live">Live</span>
      </div>
      <div className="p-3 flex flex-col">
        {txns.map((tx, i) => (
          <div key={tx.id}
            className="flex items-center gap-3 py-2.5 text-xs"
            style={{
              opacity: Math.max(0.3, 1 - i * 0.1),
              borderBottom: i < txns.length - 1 ? '1px solid rgba(56,140,255,0.06)' : 'none',
            }}>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: tx.brand.color + '22' }}>
              {tx.brand.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs truncate">
                {tx.brand.name} {tx.brand.prefix}{tx.store} — {tx.city}
              </div>
              <div className="font-mono text-[10px]" style={{ color: 'var(--text3)' }}>
                {tx.timeAgo}
              </div>
            </div>
            <div className="font-mono font-medium text-xs flex-shrink-0"
              style={{ color: 'var(--green)' }}>
              +${tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
