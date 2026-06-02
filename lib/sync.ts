import { sql } from './db'
import {
  fetchR365Locations, fetchR365DailySales, fetchR365Labor,
  fetchR365FoodCost, fetchR365Expenses, fetchR365Transactions,
} from './r365'
import {
  upsertDailySales, upsertLaborDaily, createAlert,
} from './queries'
import { format, subDays } from 'date-fns'

// ── Location ID cache: R365 ID → our DB ID ────────────────────────
let locationIdCache: Record<string, number> = {}

async function getLocationIdMap(): Promise<Record<string, number>> {
  if (Object.keys(locationIdCache).length > 0) return locationIdCache

  const rows = await sql`SELECT id, r365_id FROM locations WHERE r365_id IS NOT NULL`
  locationIdCache = {}
  for (const row of rows as any[]) {
    locationIdCache[row.r365_id] = row.id
  }
  return locationIdCache
}

// ── Sync Locations (run occasionally, not every cron) ────────────

export async function syncLocations(): Promise<{ synced: number }> {
  const locations = await fetchR365Locations()
  let synced = 0

  for (const loc of locations) {
    // Look up brand_id from slug
    const brandRows = await sql`SELECT id FROM brands WHERE slug = ${loc.brand_slug}`
    const brandId = (brandRows[0] as any)?.id ?? null

    await sql`
      INSERT INTO locations (r365_id, brand_id, name, number, address, city, state, zip, phone, status)
      VALUES (
        ${loc.r365_id}, ${brandId}, ${loc.name}, ${loc.number},
        ${loc.address}, ${loc.city}, ${loc.state}, ${loc.zip}, ${loc.phone}, ${loc.status}
      )
      ON CONFLICT (r365_id)
      DO UPDATE SET
        name    = EXCLUDED.name,
        status  = EXCLUDED.status,
        city    = EXCLUDED.city,
        state   = EXCLUDED.state,
        updated_at = NOW()
    `
    synced++
  }

  // Invalidate cache
  locationIdCache = {}
  return { synced }
}

// ── Sync Daily Sales ─────────────────────────────────────────────

export async function syncDailySales(
  startDate: string,
  endDate: string
): Promise<{ synced: number; errors: number }> {
  const idMap   = await getLocationIdMap()
  const rawData = await fetchR365DailySales(startDate, endDate)

  const records = rawData
    .map(r => ({
      ...r,
      location_id: idMap[r.r365_location_id],
    }))
    .filter(r => r.location_id) // skip unmapped locations

  const synced = await upsertDailySales(records)

  // Auto-generate alerts for outliers
  await detectSalesAnomalies(records)

  await logSync('r365', 'daily_sales', 'success', synced)
  return { synced, errors: 0 }
}

// ── Sync Labor ───────────────────────────────────────────────────

export async function syncLabor(
  startDate: string,
  endDate: string
): Promise<{ synced: number }> {
  const idMap    = await getLocationIdMap()
  const rawData  = await fetchR365Labor(startDate, endDate)

  // Fetch sales for the same period to compute labor %
  const salesRows = await sql`
    SELECT location_id, business_date, net_sales
    FROM daily_sales
    WHERE business_date BETWEEN ${startDate} AND ${endDate}
  `
  const salesMap: Record<string, number> = {}
  for (const row of salesRows as any[]) {
    salesMap[`${row.location_id}_${row.business_date}`] = Number(row.net_sales)
  }

  const records = rawData
    .map(r => {
      const locId   = idMap[r.r365_location_id]
      const sales   = salesMap[`${locId}_${r.business_date}`] ?? 0
      const laborPct = sales > 0 ? (r.total_cost / sales) * 100 : null
      return { ...r, location_id: locId, labor_pct: laborPct }
    })
    .filter(r => r.location_id)

  const synced = await upsertLaborDaily(records)
  await logSync('r365', 'labor', 'success', synced)
  return { synced }
}

// ── Sync Food Cost ───────────────────────────────────────────────

export async function syncFoodCost(
  startDate: string,
  endDate: string
): Promise<{ synced: number }> {
  const idMap   = await getLocationIdMap()
  const rawData = await fetchR365FoodCost(startDate, endDate)

  const salesRows = await sql`
    SELECT location_id, business_date, net_sales
    FROM daily_sales
    WHERE business_date BETWEEN ${startDate} AND ${endDate}
  `
  const salesMap: Record<string, number> = {}
  for (const row of salesRows as any[]) {
    salesMap[`${row.location_id}_${row.business_date}`] = Number(row.net_sales)
  }

  let synced = 0
  for (const r of rawData) {
    const locId    = idMap[r.r365_location_id]
    if (!locId) continue
    const sales    = salesMap[`${locId}_${r.business_date}`] ?? 0
    const costPct  = sales > 0 ? (r.total_cogs / sales) * 100 : null
    const wastePct = sales > 0 ? (r.waste_amount / sales) * 100 : null

    await sql`
      INSERT INTO food_cost_daily
        (location_id, business_date, total_cogs, food_cost, beverage_cost,
         paper_cost, waste_amount, variance, food_cost_pct, waste_pct)
      VALUES (
        ${locId}, ${r.business_date}, ${r.total_cogs}, ${r.food_cost},
        ${r.beverage_cost}, ${r.paper_cost}, ${r.waste_amount},
        ${r.variance}, ${costPct}, ${wastePct}
      )
      ON CONFLICT (location_id, business_date)
      DO UPDATE SET
        total_cogs    = EXCLUDED.total_cogs,
        waste_amount  = EXCLUDED.waste_amount,
        food_cost_pct = EXCLUDED.food_cost_pct,
        waste_pct     = EXCLUDED.waste_pct
    `
    synced++
  }

  await logSync('r365', 'food_cost', 'success', synced)
  return { synced }
}

// ── Sync Expenses ────────────────────────────────────────────────

export async function syncExpenses(
  startDate: string,
  endDate: string
): Promise<{ synced: number }> {
  const idMap   = await getLocationIdMap()
  const rawData = await fetchR365Expenses(startDate, endDate)
  let synced = 0

  for (const r of rawData) {
    const locId = idMap[r.r365_location_id]
    if (!locId) continue

    await sql`
      INSERT INTO expenses
        (r365_id, location_id, invoice_date, due_date, vendor_name,
         vendor_id, category, gl_account, amount, status, description)
      VALUES (
        ${r.r365_id}, ${locId}, ${r.invoice_date}, ${r.due_date},
        ${r.vendor_name}, ${r.vendor_id}, ${r.category}, ${r.gl_account},
        ${r.amount}, ${r.status}, ${r.description}
      )
      ON CONFLICT (r365_id) DO NOTHING
    `
    synced++
  }

  await logSync('r365', 'expenses', 'success', synced)
  return { synced }
}

// ── Full Sync (all data types, configurable date range) ───────────

export async function runFullSync(daysBack = 2): Promise<Record<string, any>> {
  const endDate   = format(new Date(), 'yyyy-MM-dd')
  const startDate = format(subDays(new Date(), daysBack), 'yyyy-MM-dd')

  console.log(`[Sync] Running full sync ${startDate} → ${endDate}`)

  const results: Record<string, any> = {}

  try { results.sales    = await syncDailySales(startDate, endDate)  } catch (e: any) { results.sales    = { error: e.message } }
  try { results.labor    = await syncLabor(startDate, endDate)       } catch (e: any) { results.labor    = { error: e.message } }
  try { results.foodcost = await syncFoodCost(startDate, endDate)    } catch (e: any) { results.foodcost = { error: e.message } }
  try { results.expenses = await syncExpenses(startDate, endDate)    } catch (e: any) { results.expenses = { error: e.message } }

  console.log('[Sync] Complete', results)
  return results
}

// ── Anomaly Detection ─────────────────────────────────────────────

async function detectSalesAnomalies(records: any[]): Promise<void> {
  for (const r of records) {
    // Low sales alert: if a location had 0 sales on a weekday
    if (r.net_sales === 0 || r.transaction_count === 0) {
      const day = new Date(r.business_date).getDay()
      if (day > 0 && day < 6) { // Monday–Friday
        await createAlert({
          location_id: r.location_id,
          alert_type:  'zero_sales',
          severity:    'critical',
          title:       'Zero sales reported on weekday',
          message:     `No sales recorded for ${r.business_date}. POS may be offline.`,
          metric_value: 0,
          metric_label: 'Net Sales',
        }).catch(() => {}) // don't break sync on alert failure
      }
    }
  }
}

// ── Sync Log ─────────────────────────────────────────────────────

async function logSync(
  source: string,
  syncType: string,
  status: 'success' | 'error' | 'partial',
  recordsSynced: number,
  errorMessage?: string
) {
  await sql`
    INSERT INTO sync_log (source, sync_type, status, records_synced, error_message, completed_at)
    VALUES (${source}, ${syncType}, ${status}, ${recordsSynced}, ${errorMessage ?? null}, NOW())
  `.catch(console.error)
}
