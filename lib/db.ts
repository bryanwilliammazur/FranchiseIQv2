import { neon, neonConfig } from '@neondatabase/serverless'

// Enable connection pooling for serverless
neonConfig.fetchConnectionCache = true

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create the SQL query function
export const sql = neon(process.env.DATABASE_URL)

// ── Type definitions matching our schema ────────────────────────

export interface Brand {
  id: number
  slug: string
  name: string
  color: string
  emoji: string
  active: boolean
}

export interface Location {
  id: number
  r365_id: string | null
  brand_id: number
  name: string
  number: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  lat: number | null
  lng: number | null
  status: 'open' | 'closed' | 'remodeling' | 'opening_soon'
  has_drive_thru: boolean
  has_delivery: boolean
}

export interface DailySales {
  id: number
  location_id: number
  business_date: string
  net_sales: number
  transaction_count: number
  avg_check: number
  drive_thru_sales: number
  delivery_sales: number
  discount_amount: number
}

export interface LaborDaily {
  id: number
  location_id: number
  business_date: string
  total_hours: number
  total_cost: number
  overtime_hours: number
  labor_pct: number
  employee_count: number
}

export interface FoodCostDaily {
  id: number
  location_id: number
  business_date: string
  total_cogs: number
  waste_amount: number
  food_cost_pct: number
  waste_pct: number
}

export interface Expense {
  id: number
  location_id: number
  invoice_date: string
  vendor_name: string
  category: string
  amount: number
  status: string
}

export interface Alert {
  id: number
  location_id: number | null
  brand_id: number | null
  alert_type: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  message: string | null
  metric_value: number | null
  resolved: boolean
  created_at: string
}

export interface PortfolioSummary {
  brand: string
  brand_name: string
  color: string
  location_count: number
  total_revenue: number
  total_transactions: number
  avg_check: number
  total_labor_cost: number
  total_cogs: number
  avg_labor_pct: number
  avg_food_cost_pct: number
}

export interface LocationPerformance {
  id: number
  name: string
  number: string | null
  city: string | null
  state: string | null
  brand: string
  color: string
  revenue_30d: number
  transactions_30d: number
  avg_check: number
  avg_labor_pct: number
  avg_food_cost_pct: number
  rank_in_brand: number
  rank_overall: number
}
