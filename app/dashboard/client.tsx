'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ── Original design CSS ──────────────────────────────────────────
const CSS = `
  :root {
    --bg:#080c14;--bg2:#0d1520;--bg3:#111d2e;
    --surface:#0f1e30;--surface2:#162540;
    --border:rgba(56,140,255,0.12);--border2:rgba(56,140,255,0.22);
    --accent:#2e7dff;--accent2:#00e5ff;--accent3:#ff6b35;--accent4:#a259ff;
    --gold:#ffb800;--green:#00e096;--red:#ff4560;
    --text:#e8f0fe;--text2:#8aabc8;--text3:#4a6a8a;
    --glow:rgba(46,125,255,0.15);
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--bg);color:var(--text);font-family:'Instrument Sans',sans-serif;min-height:100vh;overflow-x:hidden;}
  body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(46,125,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(46,125,255,0.03) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0;}
  .shell{display:flex;height:100vh;position:relative;z-index:1;}
  .sidebar{width:260px;flex-shrink:0;background:linear-gradient(180deg,var(--bg2) 0%,var(--bg) 100%);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;position:relative;}
  .logo-area{padding:28px 24px 20px;border-bottom:1px solid var(--border);}
  .logo{font-family:'Syne',sans-serif;font-weight:800;font-size:22px;letter-spacing:-0.5px;background:linear-gradient(135deg,#fff 0%,var(--accent2) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
  .logo span{background:linear-gradient(135deg,var(--accent) 0%,var(--accent4) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
  .logo-sub{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--text3);margin-top:4px;text-transform:uppercase;}
  .brand-chips{padding:16px 20px;border-bottom:1px solid var(--border);}
  .brand-chips-label{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--text3);text-transform:uppercase;margin-bottom:10px;}
  .chips-wrap{display:flex;flex-wrap:wrap;gap:5px;}
  .chip{font-size:10px;font-weight:600;padding:3px 9px;border-radius:20px;border:1px solid;cursor:pointer;transition:all 0.2s;white-space:nowrap;}
  .chip.jib{color:#ff9800;border-color:rgba(255,152,0,0.3);background:rgba(255,152,0,0.08);}
  .chip.pop{color:#ff4d4d;border-color:rgba(255,77,77,0.3);background:rgba(255,77,77,0.08);}
  .chip.den{color:#ffb800;border-color:rgba(255,184,0,0.3);background:rgba(255,184,0,0.08);}
  .chip.del{color:#00c853;border-color:rgba(0,200,83,0.3);background:rgba(0,200,83,0.08);}
  .chip.cor{color:#64b5f6;border-color:rgba(100,181,246,0.3);background:rgba(100,181,246,0.08);}
  .chip.all{color:var(--accent2);border-color:rgba(0,229,255,0.3);background:rgba(0,229,255,0.08);}
  .chip.active{opacity:1;transform:scale(1.05);}
  .nav{flex:1;padding:16px 12px;overflow-y:auto;}
  .nav::-webkit-scrollbar{width:3px;}
  .nav::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}
  .nav-section-label{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--text3);text-transform:uppercase;padding:14px 12px 6px;}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;transition:all 0.18s;font-size:13.5px;font-weight:500;color:var(--text2);position:relative;text-decoration:none;}
  .nav-item:hover{background:var(--surface);color:var(--text);}
  .nav-item.active{background:linear-gradient(90deg,rgba(46,125,255,0.15),rgba(46,125,255,0.05));color:#fff;border:1px solid var(--border2);}
  .nav-item.active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:2px;background:var(--accent);border-radius:2px;}
  .nav-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0;}
  .nav-badge{margin-left:auto;font-family:'DM Mono',monospace;font-size:9px;background:rgba(46,125,255,0.2);color:var(--accent2);border:1px solid rgba(0,229,255,0.2);padding:1px 6px;border-radius:10px;}
  .nav-badge.red{background:rgba(255,69,96,0.2);color:var(--red);border-color:rgba(255,69,96,0.2);}
  .nav-badge.green{background:rgba(0,224,150,0.1);color:var(--green);border-color:rgba(0,224,150,0.2);}
  .nav-badge.purple{background:rgba(162,89,255,0.2);color:var(--accent4);border-color:rgba(162,89,255,0.2);}
  .ai-status{padding:14px 20px;border-top:1px solid var(--border);background:var(--bg2);}
  .ai-status-header{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
  .pulse-dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:pulse 2s infinite;}
  .ai-status-label{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1px;color:var(--green);text-transform:uppercase;}
  .ai-status-desc{font-size:11px;color:var(--text3);line-height:1.5;}
  .main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
  .topbar{height:60px;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 28px;gap:20px;background:rgba(8,12,20,0.8);backdrop-filter:blur(10px);flex-shrink:0;}
  .topbar-title{font-family:'Syne',sans-serif;font-weight:700;font-size:17px;letter-spacing:-0.3px;}
  .topbar-breadcrumb{font-family:'DM Mono',monospace;font-size:11px;color:var(--text3);}
  .topbar-right{margin-left:auto;display:flex;align-items:center;gap:14px;}
  .trs{display:flex;background:var(--surface);border:1px solid var(--border);border-radius:8px;overflow:hidden;}
  .trs-btn{padding:5px 12px;font-family:'DM Mono',monospace;font-size:11px;cursor:pointer;color:var(--text3);border:none;background:transparent;transition:all 0.15s;letter-spacing:0.5px;}
  .trs-btn.active{background:var(--accent);color:#fff;}
  .icon-btn{width:34px;height:34px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text2);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;transition:all 0.15s;position:relative;}
  .alert-badge-dot{position:absolute;top:4px;right:4px;width:8px;height:8px;border-radius:50%;background:var(--red);border:1.5px solid var(--bg);}
  .ticker-wrap{overflow:hidden;height:34px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--bg2);display:flex;align-items:center;flex-shrink:0;}
  .ticker-label{background:var(--accent);color:var(--bg);font-family:'DM Mono',monospace;font-size:9px;font-weight:500;letter-spacing:1.5px;padding:0 14px;height:100%;display:flex;align-items:center;flex-shrink:0;text-transform:uppercase;z-index:1;}
  .ticker-track{display:flex;animation:ticker 40s linear infinite;white-space:nowrap;}
  .ticker-item{display:flex;align-items:center;gap:6px;padding:0 28px;font-family:'DM Mono',monospace;font-size:11px;color:var(--text2);border-right:1px solid var(--border);}
  .ticker-val.up{color:var(--green);}
  .ticker-val.down{color:var(--red);}
  .content{flex:1;overflow-y:auto;padding:24px 28px;}
  .content::-webkit-scrollbar{width:4px;}
  .content::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px;}
  .kpi-grid-6{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:22px;}
  .kpi-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px 20px;position:relative;overflow:hidden;transition:border-color 0.2s;}
  .kpi-card:hover{border-color:var(--border2);}
  .kpi-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--card-accent,var(--accent));border-radius:12px 12px 0 0;}
  .kpi-card.gold{--card-accent:var(--gold);}
  .kpi-card.green{--card-accent:var(--green);}
  .kpi-card.red{--card-accent:var(--red);}
  .kpi-card.cyan{--card-accent:var(--accent2);}
  .kpi-label{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1.5px;color:var(--text3);text-transform:uppercase;margin-bottom:10px;}
  .kpi-value{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;letter-spacing:-1px;line-height:1;margin-bottom:8px;}
  .kpi-change{font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px;}
  .kpi-change.up{color:var(--green);}
  .kpi-change.down{color:var(--red);}
  .kpi-sub{font-size:11px;color:var(--text3);margin-top:2px;}
  .two-col{display:grid;grid-template-columns:1fr 380px;gap:14px;margin-bottom:14px;}
  .three-col{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:14px;}
  .panel{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;}
  .panel-header{display:flex;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);gap:10px;}
  .panel-title{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;letter-spacing:-0.2px;}
  .panel-badge-live{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;padding:2px 8px;border-radius:10px;text-transform:uppercase;background:rgba(0,224,150,0.1);color:var(--green);border:1px solid rgba(0,224,150,0.2);animation:pulse 2s infinite;}
  .panel-badge-ai{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;padding:2px 8px;border-radius:10px;text-transform:uppercase;background:rgba(162,89,255,0.1);color:var(--accent4);border:1px solid rgba(162,89,255,0.2);}
  .panel-actions{margin-left:auto;display:flex;gap:8px;}
  .panel-btn{font-family:'DM Mono',monospace;font-size:10px;padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text3);cursor:pointer;transition:all 0.15s;}
  .panel-body{padding:20px;}
  .brand-table{width:100%;border-collapse:collapse;}
  .brand-table th{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.5px;color:var(--text3);text-transform:uppercase;text-align:left;padding:8px 16px;border-bottom:1px solid var(--border);font-weight:400;}
  .brand-table td{padding:11px 16px;font-size:13px;border-bottom:1px solid rgba(56,140,255,0.06);vertical-align:middle;}
  .brand-table tr:last-child td{border-bottom:none;}
  .brand-table tr:hover td{background:rgba(46,125,255,0.04);}
  .brand-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;}
  .perf-bar-wrap{display:flex;align-items:center;gap:8px;}
  .perf-bar{height:4px;border-radius:2px;flex:1;background:var(--bg3);overflow:hidden;}
  .perf-bar-fill{height:100%;border-radius:2px;}
  .val-up{color:var(--green);font-size:12px;font-weight:600;}
  .val-down{color:var(--red);font-size:12px;font-weight:600;}
  .insight-list{display:flex;flex-direction:column;gap:10px;}
  .insight-item{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;display:flex;gap:12px;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;}
  .insight-item:hover{border-color:var(--border2);transform:translateX(2px);}
  .insight-item::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--icolor,var(--accent));border-radius:10px 0 0 10px;}
  .insight-icon{font-size:22px;flex-shrink:0;margin-top:1px;}
  .insight-type{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);margin-bottom:3px;}
  .insight-title{font-weight:600;font-size:13px;margin-bottom:4px;line-height:1.3;}
  .insight-desc{font-size:11.5px;color:var(--text2);line-height:1.5;}
  .insight-impact{font-family:'DM Mono',monospace;font-size:11px;margin-top:6px;font-weight:500;color:var(--green);}
  .insight-impact.neg{color:var(--red);}
  .alert-list{display:flex;flex-direction:column;gap:8px;}
  .alert-item{display:flex;gap:12px;padding:12px;border-radius:9px;font-size:12.5px;border:1px solid;}
  .alert-item.critical{background:rgba(255,69,96,0.06);border-color:rgba(255,69,96,0.2);}
  .alert-item.warning{background:rgba(255,184,0,0.06);border-color:rgba(255,184,0,0.2);}
  .alert-item.info{background:rgba(0,229,255,0.04);border-color:rgba(0,229,255,0.15);}
  .tx-list{display:flex;flex-direction:column;}
  .tx-item{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(56,140,255,0.06);font-size:12.5px;}
  .tx-item:last-child{border-bottom:none;}
  .tx-brand{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;}
  .tx-info{flex:1;}
  .tx-store{font-weight:600;font-size:12px;}
  .tx-time{font-family:'DM Mono',monospace;font-size:10px;color:var(--text3);}
  .tx-amount{font-family:'DM Mono',monospace;font-weight:500;color:var(--green);}
  .map-placeholder{height:220px;background:linear-gradient(135deg,#0a1628 0%,#0d1e36 100%);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:var(--text3);position:relative;overflow:hidden;font-size:13px;}
  .map-placeholder::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(46,125,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(46,125,255,0.06) 1px,transparent 1px);background-size:20px 20px;}
  .map-dot{position:absolute;width:8px;height:8px;border-radius:50%;}
  .stat-box{flex:1;text-align:center;padding:10px;background:var(--bg3);border-radius:8px;border:1px solid var(--border);}
  .stat-num{font-family:'Syne',sans-serif;font-weight:800;font-size:22px;}
  .stat-label{font-size:11px;color:var(--text3);}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.6;transform:scale(0.85);}}
  @keyframes ticker{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
`

// ── Sample data (shown until DB connects) ────────────────────────
const SAMPLE_PORTFOLIO = [
  { brand:'jib',    brand_name:'Jack in the Box', color:'#ff9800', location_count:92,  total_revenue:16200000, avg_labor_pct:27.8, avg_food_cost_pct:30.2, total_transactions:980000 },
  { brand:'popeyes',brand_name:'Popeyes',         color:'#ff4d4d', location_count:64,  total_revenue:10800000, avg_labor_pct:26.4, avg_food_cost_pct:31.8, total_transactions:720000 },
  { brand:'dennys', brand_name:"Denny's",          color:'#ffb800', location_count:48,  total_revenue:7400000,  avg_labor_pct:31.2, avg_food_cost_pct:33.4, total_transactions:420000 },
  { brand:'deltaco', brand_name:'Del Taco',        color:'#00c853', location_count:32,  total_revenue:5200000,  avg_labor_pct:28.6, avg_food_cost_pct:29.8, total_transactions:360000 },
  { brand:'corner', brand_name:'Corner Bakery',    color:'#64b5f6', location_count:18,  total_revenue:3200000,  avg_labor_pct:29.4, avg_food_cost_pct:31.2, total_transactions:180000 },
]

const SAMPLE_INSIGHTS = [
  { insight_type:'savings',     icolor:'var(--green)',  icon:'💚', title:"Reduce food waste at 14 Denny's locations",        desc:'AI detected 2.8% above-average waste. Adjusting prep schedules could save $82K/yr.',  impact:'💰 Estimated savings: $82,400/yr' },
  { insight_type:'revenue',     icolor:'var(--gold)',   icon:'⭐', title:'Late-night daypart underperforming at 28 JIB',     desc:'Competitor analysis shows $340 AUV gap 10PM–2AM. Targeted promo could capture share.', impact:'📈 Revenue potential: $1.2M/yr' },
  { insight_type:'alert',       icolor:'var(--red)',    icon:'🔴', title:'Food cost spike at 6 Popeyes locations',            desc:'Chicken wing cost up 18% from supplier — recommend contract review.',                  impact:'⚠️ Impact: +$43K/mo if unaddressed', neg:true },
  { insight_type:'opportunity', icolor:'var(--accent4)',icon:'🚀', title:'3 high-traffic corridors near Del Taco clusters',  desc:'Foot traffic + competitor data suggests strong ROI for 2–3 new units.',               impact:'📍 Projected AUV: $1.8M/unit' },
  { insight_type:'marketing',   icolor:'var(--accent2)',icon:'📣', title:'Social engagement up 34% for Popeyes campaign',    desc:'Recommend scaling in Phoenix and Las Vegas — strong sentiment signal.',                impact:'🎯 Lift potential: +11% traffic' },
]

const SAMPLE_ALERTS = [
  { severity:'critical', text:'Popeyes #0847 — POS offline 2h 14m',              time:'2:14 ago' },
  { severity:'critical', text:"Denny's #1204 — Health inspection due in 3 days", time:'Today' },
  { severity:'warning',  text:'JIB #0323 — Labor over budget by 4.2%',           time:'1h ago' },
  { severity:'warning',  text:'Del Taco #0614 — Beef inventory low (2 days)',    time:'3h ago' },
  { severity:'info',     text:'Corner Bakery lease renewal due in 60 days',      time:'Today' },
]

const NAV = [
  { section:'Overview', items:[
    { href:'/dashboard',     icon:'◈', label:'Executive Dashboard', badge:'LIVE',  badgeClass:'' },
    { href:'/dynamic',       icon:'✦', label:'Dynamic View',        badge:'AI',    badgeClass:'' },
  ]},
  { section:'Operations', items:[
    { href:'/sales',         icon:'📊', label:'Sales & Transactions' },
    { href:'/inventory',     icon:'📦', label:'Inventory & COGS',    badge:'3',    badgeClass:'red' },
    { href:'/expenses',      icon:'💳', label:'Expenses & Labor' },
    { href:'/locations',     icon:'📍', label:'Locations & Property' },
  ]},
  { section:'Intelligence', items:[
    { href:'/ai',            icon:'🧠', label:'NeMo AI Command',     badge:'CLAW', badgeClass:'purple' },
    { href:'/opportunities', icon:'💡', label:'Opportunities',        badge:'12',   badgeClass:'green' },
    { href:'/marketing',     icon:'📣', label:'Marketing & Campaigns' },
    { href:'/strategies',    icon:'🎯', label:'Growth Strategies' },
  ]},
  { section:'System', items:[
    { href:'/integrations',  icon:'🔗', label:'Data Integrations' },
  ]},
]

const BRANDS_FILTER = [
  { slug:'all',     label:'ALL 300+', cls:'all' },
  { slug:'jib',     label:'🍔 JIB',   cls:'jib' },
  { slug:'popeyes', label:'🍗 Pop',   cls:'pop' },
  { slug:'dennys',  label:"🥞 Den's", cls:'den' },
  { slug:'deltaco', label:'🌮 Del',   cls:'del' },
  { slug:'corner',  label:'🥐 CB',    cls:'cor' },
]

const TX_BRANDS = [
  { emoji:'🍔', color:'#ff9800', name:'JIB',     num:'#04' },
  { emoji:'🍗', color:'#ff4d4d', name:'Popeyes',  num:'#01' },
  { emoji:'🥞', color:'#ffb800', name:"Denny's",  num:'#12' },
  { emoji:'🌮', color:'#00c853', name:'Del Taco', num:'#06' },
  { emoji:'🥐', color:'#64b5f6', name:'Corner',   num:'#03' },
]
const CITIES = ['San Diego','Phoenix','Las Vegas','Riverside','Tempe','Scottsdale']

let txId = 0
function makeTx(ago: number) {
  const b = TX_BRANDS[Math.floor(Math.random() * TX_BRANDS.length)]
  const city = CITIES[Math.floor(Math.random() * CITIES.length)]
  const store = String(Math.floor(Math.random() * 900 + 100))
  const amount = (Math.random() * 55 + 7).toFixed(2)
  return { id: txId++, b, city, store, amount, time: ago === 0 ? 'Just now' : `${ago}s ago` }
}

// ── Main component ───────────────────────────────────────────────
export default function DashboardClient({ kpis, portfolio, alerts, insights }: {
  kpis: any; portfolio: any[]; alerts: any[]; insights: any[]
}) {
  const pathname = usePathname()
  const [activeBrand, setActiveBrand] = useState('all')
  const [activeRange, setActiveRange] = useState('30D')
  const [txns, setTxns] = useState(() => Array.from({ length: 6 }, (_, i) => makeTx(i * 18)))

  const p = portfolio.length ? portfolio : SAMPLE_PORTFOLIO
  const a = alerts.length   ? alerts    : SAMPLE_ALERTS
  const ins = insights.length ? insights.map(i => ({
    ...i,
    icon: { savings:'💚', revenue:'⭐', alert:'🔴', opportunity:'🚀', marketing:'📣' }[i.insight_type] ?? '💡',
    icolor: { savings:'var(--green)', revenue:'var(--gold)', alert:'var(--red)', opportunity:'var(--accent4)', marketing:'var(--accent2)' }[i.insight_type] ?? 'var(--accent)',
    desc: i.description,
    impact: i.impact_label ? `💰 ${i.impact_label}: $${Number(i.impact_amount).toLocaleString()}` : '',
  })) : SAMPLE_INSIGHTS

  const totalRev = p.reduce((s: number, b: any) => s + Number(b.total_revenue), 0)
  const totalTxns = p.reduce((s: number, b: any) => s + Number(b.total_transactions ?? 0), 0)
  const avgCheck = kpis?.avg_check ? Number(kpis.avg_check) : 14.72
  const foodCostPct = kpis?.avg_food_cost_pct ? Number(kpis.avg_food_cost_pct) : 31.8
  const laborPct = kpis?.avg_labor_pct ? Number(kpis.avg_labor_pct) : 28.4
  const vsPrior = kpis?.vs_last_period_pct ?? '8.3'

  useEffect(() => {
    const t = setInterval(() => setTxns(prev => [makeTx(0), ...prev.slice(0, 7)]), 3500)
    return () => clearInterval(t)
  }, [])

  const tickerItems = [
    ...p.map((b: any) => ({ label: b.brand_name, val: `$${(Number(b.total_revenue)/1e6).toFixed(1)}M`, up: true })),
    { label:'Food Cost %', val:`${foodCostPct.toFixed(1)}%`, up: foodCostPct < 32 },
    { label:'Labor %',     val:`${laborPct.toFixed(1)}%`,    up: laborPct < 30 },
    { label:'Avg Check',   val:`$${avgCheck.toFixed(2)}`,    up: true },
  ]
  const doubled = [...tickerItems, ...tickerItems]

  const maxRev = Math.max(...p.map((b: any) => Number(b.total_revenue)))

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <div className="shell">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="logo-area">
            <div className="logo">Franchise<span>IQ</span></div>
            <div className="logo-sub">Intelligence Platform · v1.0</div>
          </div>

          <div className="brand-chips">
            <div className="brand-chips-label">Brands</div>
            <div className="chips-wrap">
              {BRANDS_FILTER.map(b => (
                <div key={b.slug}
                  className={`chip ${b.cls} ${activeBrand === b.slug ? 'active' : ''}`}
                  onClick={() => setActiveBrand(b.slug)}>
                  {b.label}
                </div>
              ))}
            </div>
          </div>

          <nav className="nav">
            {NAV.map(section => (
              <div key={section.section}>
                <div className="nav-section-label">{section.section}</div>
                {section.items.map((item: any) => (
                  <Link key={item.href} href={item.href}
                    className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                    {item.badge && (
                      <span className={`nav-badge ${item.badgeClass ?? ''}`}>{item.badge}</span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className="ai-status">
            <div className="ai-status-header">
              <div className="pulse-dot" />
              <div className="ai-status-label">NeMo Claw Active</div>
            </div>
            <div className="ai-status-desc">
              Analyzing {(totalTxns/1e6).toFixed(1)}M+ transactions · Monitoring {p.reduce((s: number, b: any) => s + b.location_count, 0)} locations · AI insights active
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">

          {/* Topbar */}
          <div className="topbar">
            <div>
              <div className="topbar-title">Executive Dashboard</div>
              <div className="topbar-breadcrumb">FranchiseIQ › Overview</div>
            </div>
            <div className="topbar-right">
              <div className="trs">
                {['1D','7D','30D','QTD','YTD'].map(r => (
                  <button key={r} className={`trs-btn ${activeRange === r ? 'active' : ''}`}
                    onClick={() => setActiveRange(r)}>{r}</button>
                ))}
              </div>
              <div className="icon-btn">
                🔔
                <div className="alert-badge-dot" />
              </div>
              <div className="icon-btn">⚙️</div>
              <div className="icon-btn">👤</div>
            </div>
          </div>

          {/* Ticker */}
          <div className="ticker-wrap">
            <div className="ticker-label">Live</div>
            <div className="ticker-track">
              {doubled.map((item, i) => (
                <div key={i} className="ticker-item">
                  {item.label}: <span className={`ticker-val ${item.up ? 'up' : 'down'}`}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="content">

            {/* Primary KPIs */}
            <div className="kpi-grid">
              <div className="kpi-card gold">
                <div className="kpi-label">💰 Total Revenue (30D)</div>
                <div className="kpi-value">${(totalRev/1e6).toFixed(1)}M</div>
                <div className="kpi-change up">↑ {vsPrior}% <span style={{color:'var(--text3)',fontWeight:400}}>vs last period</span></div>
                <div className="kpi-sub">Across all {p.reduce((s: number, b: any) => s + b.location_count, 0)} locations</div>
              </div>
              <div className="kpi-card green">
                <div className="kpi-label">📈 Net Operating Profit</div>
                <div className="kpi-value">${((totalRev*0.143)/1e6).toFixed(1)}M</div>
                <div className="kpi-change up">↑ 12.1%</div>
                <div className="kpi-sub">14.3% margin · Target: 15%</div>
              </div>
              <div className="kpi-card cyan">
                <div className="kpi-label">🧾 Avg Check Size</div>
                <div className="kpi-value">${avgCheck.toFixed(2)}</div>
                <div className="kpi-change up">↑ 3.4%</div>
                <div className="kpi-sub">{(totalTxns/1e6).toFixed(2)}M transactions</div>
              </div>
              <div className="kpi-card red">
                <div className="kpi-label">⚠️ Food Cost %</div>
                <div className="kpi-value">{foodCostPct.toFixed(1)}%</div>
                <div className="kpi-change down">↑ {(foodCostPct-30.5).toFixed(1)}% <span style={{color:'var(--text3)',fontWeight:400}}>vs target</span></div>
                <div className="kpi-sub">Target: 30.5% · AI alert active</div>
              </div>
            </div>

            {/* Secondary KPIs */}
            <div className="kpi-grid-6">
              {[
                { label:'Labor %',        val:`${laborPct.toFixed(1)}%`, warn: laborPct > 30 },
                { label:'Drive-Thru Avg', val:'3m 42s',  warn:false },
                { label:'Guest Score',    val:'4.1★',    warn:false },
                { label:'Waste %',        val:'2.8%',    warn:false },
                { label:'Open Positions', val:'184',     warn:true },
                { label:'Catering Rev',   val:'$318K',   warn:false },
              ].map(item => (
                <div key={item.label} className="kpi-card" style={{padding:'14px 16px'}}>
                  <div className="kpi-label" style={{fontSize:8}}>{item.label}</div>
                  <div className="kpi-value" style={{fontSize:20,color:item.warn?'var(--red)':'inherit'}}>{item.val}</div>
                </div>
              ))}
            </div>

            {/* Main row: chart + insights */}
            <div className="two-col">
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Revenue by Brand · 30-Day Trend</div>
                  <span className="panel-badge-live">Live</span>
                  <div className="panel-actions">
                    <button className="panel-btn">By Store</button>
                    <button className="panel-btn">Export</button>
                  </div>
                </div>
                <div className="panel-body">
                  {/* Mini bar chart */}
                  <div style={{display:'flex',alignItems:'flex-end',gap:3,height:60,marginBottom:16}}>
                    {Array.from({length:30},(_,i)=>{
                      const h = 30 + Math.sin(i/4)*15 + Math.random()*20
                      return <div key={i} style={{flex:1,height:`${h}%`,background:'var(--accent)',opacity:0.6,borderRadius:'3px 3px 0 0'}} />
                    })}
                  </div>
                  <table className="brand-table">
                    <thead>
                      <tr>
                        <th>Brand</th><th>Stores</th><th>Revenue</th><th>vs LY</th><th>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.map((b: any, i: number) => {
                        const pct = Math.round((Number(b.total_revenue)/maxRev)*95)
                        const changes = ['+9.4%','+14.2%','-2.1%','+6.8%','+4.1%']
                        const ups = [true,true,false,true,true]
                        return (
                          <tr key={b.brand}>
                            <td><span className="brand-dot" style={{background:b.color}} /><strong>{b.brand_name}</strong></td>
                            <td style={{color:'var(--text3)',fontFamily:'DM Mono,monospace',fontSize:11}}>{b.location_count} stores</td>
                            <td>${(Number(b.total_revenue)/1e6).toFixed(1)}M</td>
                            <td><span className={ups[i]?'val-up':'val-down'}>{changes[i]}</span></td>
                            <td>
                              <div className="perf-bar-wrap">
                                <div className="perf-bar">
                                  <div className="perf-bar-fill" style={{width:`${pct}%`,background:b.color}} />
                                </div>
                                {pct}%
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Insights */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">AI Insights</div>
                  <span className="panel-badge-ai">NeMo Claw</span>
                </div>
                <div style={{padding:14}}>
                  <div className="insight-list">
                    {ins.map((item: any, i: number) => (
                      <div key={i} className="insight-item" style={{'--icolor':item.icolor} as any}>
                        <div className="insight-icon">{item.icon}</div>
                        <div>
                          <div className="insight-type">{item.insight_type}</div>
                          <div className="insight-title">{item.title}</div>
                          <div className="insight-desc">{item.desc ?? item.description}</div>
                          {item.impact && (
                            <div className={`insight-impact ${item.neg ? 'neg' : ''}`}>{item.impact}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom row */}
            <div className="three-col">
              {/* Alerts */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">🚨 Active Alerts</div>
                  <span style={{marginLeft:'auto',fontFamily:'DM Mono,monospace',fontSize:9,padding:'2px 8px',borderRadius:10,background:'rgba(255,69,96,0.1)',color:'var(--red)',border:'1px solid rgba(255,69,96,0.2)'}}>
                    {a.length} OPEN
                  </span>
                </div>
                <div style={{padding:14}}>
                  <div className="alert-list">
                    {a.slice(0,5).map((al: any, i: number) => (
                      <div key={i} className={`alert-item ${al.severity}`}>
                        <span>{al.severity==='critical'?'🔴':al.severity==='warning'?'🟡':'🔵'}</span>
                        <span style={{flex:1}}>{al.text ?? al.title ?? al.message}</span>
                        {al.time && <span style={{fontFamily:'DM Mono,monospace',fontSize:10,color:'var(--text3)'}}>{al.time}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Transactions */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">⚡ Live Transactions</div>
                  <span className="panel-badge-live">Live</span>
                </div>
                <div style={{padding:'14px 16px'}}>
                  <div className="tx-list">
                    {txns.slice(0,6).map((tx: any) => (
                      <div key={tx.id} className="tx-item">
                        <div className="tx-brand" style={{background:tx.b.color+'22'}}>{tx.b.emoji}</div>
                        <div className="tx-info">
                          <div className="tx-store">{tx.b.name} {tx.b.num}{tx.store} — {tx.city}</div>
                          <div className="tx-time">{tx.time}</div>
                        </div>
                        <div className="tx-amount">+${tx.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location Map */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">📍 Location Overview</div>
                  <div className="panel-actions"><button className="panel-btn">Full Map</button></div>
                </div>
                <div className="panel-body">
                  <div className="map-placeholder">
                    {[
                      {l:15,t:30,c:'#ff9800'},{l:25,t:55,c:'#ff4d4d'},{l:40,t:25,c:'#ffb800'},
                      {l:55,t:60,c:'#00c853'},{l:65,t:35,c:'#64b5f6'},{l:75,t:50,c:'#ff9800'},
                      {l:30,t:70,c:'#ff4d4d'},{l:50,t:45,c:'#ffb800'},{l:70,t:20,c:'#00c853'},
                      {l:20,t:45,c:'#64b5f6'},{l:80,t:65,c:'#ff9800'},{l:45,t:75,c:'#ff4d4d'},
                    ].map((d,i) => (
                      <div key={i} className="map-dot" style={{left:`${d.l}%`,top:`${d.t}%`,background:d.c,boxShadow:`0 0 8px ${d.c}`}} />
                    ))}
                    <div style={{position:'relative',zIndex:1,fontSize:28}}>🗺️</div>
                    <div style={{position:'relative',zIndex:1,fontWeight:600,color:'var(--text2)'}}>300+ Locations · 12 States</div>
                    <div style={{position:'relative',zIndex:1,fontSize:11}}>CA · AZ · NV · TX · FL · CO · WA · OR · UT · NM · ID · MT</div>
                  </div>
                  <div style={{display:'flex',gap:8,marginTop:12}}>
                    <div className="stat-box"><div className="stat-num" style={{color:'var(--green)'}}>284</div><div className="stat-label">Operating</div></div>
                    <div className="stat-box"><div className="stat-num" style={{color:'var(--gold)'}}>14</div><div className="stat-label">Remodeling</div></div>
                    <div className="stat-box"><div className="stat-num" style={{color:'var(--accent2)'}}>8</div><div className="stat-label">Opening Soon</div></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
