import { sql, PortfolioSummary, LocationPerformance, Alert } from './db'

// ── PORTFOLIO / DASHBOARD ────────────────────────────────────────

export async function getPortfolioSummary(days = 30): Promise<PortfolioSummary[]> {
  return await sql`
    SELECT
      b.slug                                    AS brand,
      b.name                                    AS brand_name,
      b.color,
      COUNT(DISTINCT l.id)::int                 AS location_count,
      COALESCE(SUM(ds.net_sales), 0)            AS total_revenue,
      COALESCE(SUM(ds.transaction_count), 0)::int AS total_transactions,
      COALESCE(AVG(ds.avg_check), 0)            AS avg_check,
      COALESCE(SUM(ld.total_cost), 0)           AS total_labor_cost,
      COALESCE(SUM(fcd.total_cogs), 0)          AS total_cogs,
      COALESCE(AVG(ld.labor_pct), 0)            AS avg_labor_pct,
      COALESCE(AVG(fcd.food_cost_pct), 0)       AS avg_food_cost_pct
    FROM brands b
    JOIN locations l ON l.brand_id = b.id AND l.status = 'open'
    LEFT JOIN daily_sales ds ON ds.location_id = l.id
      AND ds.business_date >= CURRENT_DATE - ${days} * INTERVAL '1 day'
    LEFT JOIN labor_daily ld ON ld.location_id = l.id
      AND ld.business_date >= CURRENT_DATE - ${days} * INTERVAL '1 day'
    LEFT JOIN food_cost_daily fcd ON fcd.location_id = l.id
      AND fcd.business_date >= CURRENT_DATE - ${days} * INTERVAL '1 day'
    WHERE b.active = true
    GROUP BY b.id, b.slug, b.name, b.color
    ORDER BY total_revenue DESC
  ` as PortfolioSummary[]
}

export async function getTotalKPIs(days = 30) {
  const rows = await sql`
    SELECT
      COALESCE(SUM(ds.net_sales), 0)              AS total_revenue,
      COALESCE(SUM(ds.transaction_count), 0)::int AS total_transactions,
      COALESCE(AVG(ds.avg_check), 0)              AS avg_check,
      COALESCE(AVG(fcd.food_cost_pct), 0)         AS avg_food_cost_pct,
      COALESCE(AVG(ld.labor_pct), 0)              AS avg_labor_pct,
      COUNT(DISTINCT ds.location_id)::int          AS active_locations
    FROM daily_sales ds
    JOIN locations l ON l.id = ds.location_id
    LEFT JOIN labor_daily ld ON ld.location_id = ds.location_id
      AND ld.business_date = ds.business_date
    LEFT JOIN food_cost_daily fcd ON fcd.location_id = ds.location_id
      AND fcd.business_date = ds.business_date
    WHERE ds.business_date >= CURRENT_DATE - ${days} * INTERVAL '1 day'
  `

  // Prior period for comparison
  const prior = await sql`
    SELECT COALESCE(SUM(net_sales), 0) AS total_revenue
    FROM daily_sales ds
    JOIN locations l ON l.id = ds.location_id
    WHERE ds.business_date >= CURRENT_DATE - ${days * 2} * INTERVAL '1 day'
      AND ds.business_date < CURRENT_DATE - ${days} * INTERVAL '1 day'
  `

  const current = rows[0] as any
  const priorRev = Number((prior[0] as any).total_revenue)
  const currentRev = Number(current.total_revenue)
  const vsLastPeriod = priorRev > 0
    ? ((currentRev - priorRev) / priorRev * 100).toFixed(1)
    : null

  return { ...current, vs_last_period_pct: vsLastPeriod }
}

export async function getDailyTrend(days = 30, brand?: string) {
  if (brand && brand !== 'all') {
    return await sql`
      SELECT
        ds.business_date,
        b.slug AS brand,
        SUM(ds.net_sales)::float          AS revenue,
        SUM(ds.transaction_count)::int    AS transactions,
        AVG(ds.avg_check)::float          AS avg_check
      FROM daily_sales ds
      JOIN locations l ON l.id = ds.location_id
      JOIN brands b    ON b.id = l.brand_id
      WHERE ds.business_date >= CURRENT_DATE - ${days} * INTERVAL '1 day'
        AND b.slug = ${brand}
      GROUP BY ds.business_date, b.slug
      ORDER BY ds.business_date
    `
  }

  return await sql`
    SELECT
      ds.business_date,
      b.slug AS brand,
      SUM(ds.net_sales)::float          AS revenue,
      SUM(ds.transaction_count)::int    AS transactions,
      AVG(ds.avg_check)::float          AS avg_check
    FROM daily_sales ds
    JOIN locations l ON l.id = ds.location_id
    JOIN brands b    ON b.id = l.brand_id
    WHERE ds.business_date >= CURRENT_DATE - ${days} * INTERVAL '1 day'
    GROUP BY ds.business_date, b.slug
    ORDER BY ds.business_date
  `
}

// ── LOCATIONS ────────────────────────────────────────────────────

export async function getTopLocations(limit = 20, brand?: string) {
  if (brand && brand !== 'all') {
    return await sql`
      SELECT * FROM v_location_performance
      WHERE brand = ${brand}
      ORDER BY revenue_30d DESC
      LIMIT ${limit}
    ` as LocationPerformance[]
  }

  return await sql`
    SELECT * FROM v_location_performance
    ORDER BY revenue_30d DESC
    LIMIT ${limit}
  ` as LocationPerformance[]
}

export async function getBottomLocations(limit = 10, brand?: string) {
  return await sql`
    SELECT * FROM v_location_performance
    WHERE ${brand && brand !== 'all' ? sql`brand = ${brand}` : sql`true`}
    ORDER BY revenue_30d ASC
    LIMIT ${limit}
  ` as LocationPerformance[]
}

export async function getAllLocations(brand?: string) {
  if (brand && brand !== 'all') {
    return await sql`
      SELECT l.*, b.slug AS brand_slug, b.name AS brand_name, b.color
      FROM locations l
      JOIN brands b ON b.id = l.brand_id
      WHERE b.slug = ${brand}
      ORDER BY l.name
    `
  }

  return await sql`
    SELECT l.*, b.slug AS brand_slug, b.name AS brand_name, b.color
    FROM locations l
    JOIN brands b ON b.id = l.brand_id
    ORDER BY b.name, l.name
  `
}

// ── SALES ────────────────────────────────────────────────────────

export async function getSalesByLocation(
  locationId: number,
  startDate: string,
  endDate: string
) {
  return await sql`
    SELECT * FROM daily_sales
    WHERE location_id = ${locationId}
      AND business_date BETWEEN ${startDate} AND ${endDate}
    ORDER BY business_date DESC
  `
}

export async function getHourlySalesTrend(days = 7) {
  return await sql`
    SELECT
      EXTRACT(HOUR FROM transaction_time)::int AS hour,
      COUNT(*)::int                            AS transaction_count,
      SUM(amount)::float                       AS revenue,
      AVG(amount)::float                       AS avg_check
    FROM transactions
    WHERE business_date >= CURRENT_DATE - ${days} * INTERVAL '1 day'
      AND void_flag = false
    GROUP BY hour
    ORDER BY hour
  `
}

export async function getRecentTransactions(limit = 20) {
  return await sql`
    SELECT
      t.id,
      t.amount,
      t.order_type,
      t.payment_type,
      t.transaction_time,
      l.name  AS location_name,
      l.number AS location_number,
      b.slug  AS brand,
      b.color AS brand_color,
      b.emoji AS brand_emoji
    FROM transactions t
    JOIN locations l ON l.id = t.location_id
    JOIN brands b    ON b.id = l.brand_id
    WHERE t.void_flag = false
    ORDER BY t.transaction_time DESC
    LIMIT ${limit}
  `
}

// ── LABOR ────────────────────────────────────────────────────────

export async function getLaborSummary(days = 30, brand?: string) {
  return await sql`
    SELECT
      b.slug                               AS brand,
      b.name                               AS brand_name,
      b.color,
      SUM(ld.total_hours)::float           AS total_hours,
      SUM(ld.total_cost)::float            AS total_cost,
      SUM(ld.overtime_hours)::float        AS overtime_hours,
      AVG(ld.labor_pct)::float             AS avg_labor_pct,
      COUNT(DISTINCT ld.location_id)::int  AS location_count
    FROM labor_daily ld
    JOIN locations l ON l.id = ld.location_id
    JOIN brands b    ON b.id = l.brand_id
    WHERE ld.business_date >= CURRENT_DATE - ${days} * INTERVAL '1 day'
      AND ${brand && brand !== 'all' ? sql`b.slug = ${brand}` : sql`true`}
    GROUP BY b.id, b.slug, b.name, b.color
    ORDER BY avg_labor_pct DESC
  `
}

export async function getHighLaborLocations(threshold = 32, limit = 20) {
  return await sql`
    SELECT
      l.name,
      l.number,
      b.slug AS brand,
      AVG(ld.labor_pct)::float    AS avg_labor_pct,
      SUM(ld.total_cost)::float   AS total_labor_cost,
      SUM(ld.overtime_hours)::float AS overtime_hours
    FROM labor_daily ld
    JOIN locations l ON l.id = ld.location_id
    JOIN brands b    ON b.id = l.brand_id
    WHERE ld.business_date >= CURRENT_DATE - 30 * INTERVAL '1 day'
    GROUP BY l.id, l.name, l.number, b.slug
    HAVING AVG(ld.labor_pct) > ${threshold}
    ORDER BY avg_labor_pct DESC
    LIMIT ${limit}
  `
}

// ── FOOD COST ────────────────────────────────────────────────────

export async function getFoodCostSummary(days = 30, brand?: string) {
  return await sql`
    SELECT
      b.slug                               AS brand,
      b.name                               AS brand_name,
      b.color,
      SUM(fcd.total_cogs)::float           AS total_cogs,
      SUM(fcd.waste_amount)::float         AS total_waste,
      AVG(fcd.food_cost_pct)::float        AS avg_food_cost_pct,
      AVG(fcd.waste_pct)::float            AS avg_waste_pct,
      COUNT(DISTINCT fcd.location_id)::int AS location_count
    FROM food_cost_daily fcd
    JOIN locations l ON l.id = fcd.location_id
    JOIN brands b    ON b.id = l.brand_id
    WHERE fcd.business_date >= CURRENT_DATE - ${days} * INTERVAL '1 day'
      AND ${brand && brand !== 'all' ? sql`b.slug = ${brand}` : sql`true`}
    GROUP BY b.id, b.slug, b.name, b.color
    ORDER BY avg_food_cost_pct DESC
  `
}

// ── EXPENSES ─────────────────────────────────────────────────────

export async function getExpensesByCategory(days = 30) {
  return await sql`
    SELECT
      category,
      COUNT(*)::int       AS invoice_count,
      SUM(amount)::float  AS total_amount,
      AVG(amount)::float  AS avg_amount
    FROM expenses
    WHERE invoice_date >= CURRENT_DATE - ${days} * INTERVAL '1 day'
    GROUP BY category
    ORDER BY total_amount DESC
  `
}

export async function getTopVendors(limit = 15, days = 30) {
  return await sql`
    SELECT
      vendor_name,
      COUNT(*)::int        AS invoice_count,
      SUM(amount)::float   AS total_amount
    FROM expenses
    WHERE invoice_date >= CURRENT_DATE - ${days} * INTERVAL '1 day'
    GROUP BY vendor_name
    ORDER BY total_amount DESC
    LIMIT ${limit}
  `
}

export async function getOverdueExpenses() {
  return await sql`
    SELECT e.*, l.name AS location_name, b.slug AS brand
    FROM expenses e
    JOIN locations l ON l.id = e.location_id
    JOIN brands b    ON b.id = l.brand_id
    WHERE e.status = 'pending' AND e.due_date < CURRENT_DATE
    ORDER BY e.due_date ASC
    LIMIT 50
  `
}

// ── ALERTS ───────────────────────────────────────────────────────

export async function getActiveAlerts(limit = 50): Promise<Alert[]> {
  return await sql`
    SELECT a.*, l.name AS location_name, b.slug AS brand, b.emoji
    FROM alerts a
    LEFT JOIN locations l ON l.id = a.location_id
    LEFT JOIN brands b    ON b.id = a.brand_id
    WHERE a.resolved = false
    ORDER BY
      CASE a.severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
      a.created_at DESC
    LIMIT ${limit}
  ` as Alert[]
}

export async function createAlert(alert: {
  location_id?: number
  brand_id?: number
  alert_type: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  message?: string
  metric_value?: number
  metric_label?: string
}) {
  return await sql`
    INSERT INTO alerts (location_id, brand_id, alert_type, severity, title, message, metric_value, metric_label)
    VALUES (
      ${alert.location_id ?? null},
      ${alert.brand_id ?? null},
      ${alert.alert_type},
      ${alert.severity},
      ${alert.title},
      ${alert.message ?? null},
      ${alert.metric_value ?? null},
      ${alert.metric_label ?? null}
    )
    RETURNING *
  `
}

// ── AI INSIGHTS ───────────────────────────────────────────────────

export async function getAIInsights(limit = 10) {
  return await sql`
    SELECT ai.*, b.name AS brand_name, b.color, l.name AS location_name
    FROM ai_insights ai
    LEFT JOIN brands b    ON b.id = ai.brand_id
    LEFT JOIN locations l ON l.id = ai.location_id
    WHERE (ai.expires_at IS NULL OR ai.expires_at > NOW())
    ORDER BY ai.priority_score DESC, ai.created_at DESC
    LIMIT ${limit}
  `
}

export async function upsertInsight(insight: {
  insight_type: string
  brand_id?: number
  location_id?: number
  title: string
  description?: string
  impact_amount?: number
  impact_label?: string
  priority_score?: number
  action_items?: object
}) {
  return await sql`
    INSERT INTO ai_insights
      (insight_type, brand_id, location_id, title, description, impact_amount, impact_label, priority_score, action_items, expires_at)
    VALUES (
      ${insight.insight_type},
      ${insight.brand_id ?? null},
      ${insight.location_id ?? null},
      ${insight.title},
      ${insight.description ?? null},
      ${insight.impact_amount ?? null},
      ${insight.impact_label ?? null},
      ${insight.priority_score ?? 50},
      ${JSON.stringify(insight.action_items ?? {})},
      NOW() + INTERVAL '24 hours'
    )
    ON CONFLICT DO NOTHING
    RETURNING *
  `
}

// ── SYNC HELPERS ─────────────────────────────────────────────────

export async function upsertDailySales(records: any[]) {
  if (!records.length) return 0
  let count = 0
  for (const r of records) {
    await sql`
      INSERT INTO daily_sales
        (location_id, business_date, net_sales, gross_sales, transaction_count,
         avg_check, drive_thru_sales, delivery_sales, discount_amount, tax_amount)
      VALUES (
        ${r.location_id}, ${r.business_date}, ${r.net_sales}, ${r.gross_sales ?? 0},
        ${r.transaction_count}, ${r.avg_check}, ${r.drive_thru_sales ?? 0},
        ${r.delivery_sales ?? 0}, ${r.discount_amount ?? 0}, ${r.tax_amount ?? 0}
      )
      ON CONFLICT (location_id, business_date)
      DO UPDATE SET
        net_sales = EXCLUDED.net_sales,
        transaction_count = EXCLUDED.transaction_count,
        avg_check = EXCLUDED.avg_check,
        updated_at = NOW()
    `
    count++
  }
  return count
}

export async function upsertLaborDaily(records: any[]) {
  if (!records.length) return 0
  let count = 0
  for (const r of records) {
    await sql`
      INSERT INTO labor_daily
        (location_id, business_date, total_hours, regular_hours, overtime_hours,
         total_cost, regular_cost, overtime_cost, employee_count, labor_pct)
      VALUES (
        ${r.location_id}, ${r.business_date}, ${r.total_hours}, ${r.regular_hours ?? 0},
        ${r.overtime_hours ?? 0}, ${r.total_cost}, ${r.regular_cost ?? 0},
        ${r.overtime_cost ?? 0}, ${r.employee_count ?? 0}, ${r.labor_pct ?? null}
      )
      ON CONFLICT (location_id, business_date)
      DO UPDATE SET
        total_hours = EXCLUDED.total_hours,
        total_cost = EXCLUDED.total_cost,
        labor_pct = EXCLUDED.labor_pct
    `
    count++
  }
  return count
}
