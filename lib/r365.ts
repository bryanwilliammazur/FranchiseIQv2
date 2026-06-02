// ── R365 API Client ───────────────────────────────────────────────
// Handles OAuth tokens, fetching, normalization, and retry logic

const R365_TOKEN_URL  = process.env.R365_TOKEN_URL!
const R365_API_BASE   = process.env.R365_API_BASE!
const R365_ORG_ID     = process.env.R365_ORG_ID!
const CLIENT_ID       = process.env.R365_CLIENT_ID!
const CLIENT_SECRET   = process.env.R365_CLIENT_SECRET!

// In-memory token cache (per serverless instance)
let cachedToken: { token: string; expiresAt: number } | null = null

// Brand keyword → slug mapping
const BRAND_MAP: Record<string, string> = {
  'jack in the box': 'jib',
  'popeyes':         'popeyes',
  "denny's":         'dennys',
  'dennys':          'dennys',
  'del taco':        'deltaco',
  'corner bakery':   'corner',
}

export function detectBrand(locationName: string): string {
  const lower = locationName.toLowerCase()
  for (const [keyword, slug] of Object.entries(BRAND_MAP)) {
    if (lower.includes(keyword)) return slug
  }
  return 'other'
}

// ── OAuth Token ───────────────────────────────────────────────────

async function getToken(): Promise<string> {
  // Return cached token if still valid (60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token
  }

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope:         'r365api',
  })

  const res = await fetch(R365_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    throw new Error(`R365 token error: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  cachedToken = {
    token:     data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  }

  return cachedToken.token
}

// ── Core API Request ──────────────────────────────────────────────

async function r365Get(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  const token = await getToken()
  const url   = new URL(R365_API_BASE + endpoint)

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  }

  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept':        'application/json',
      'X-R365-OrgId': R365_ORG_ID,
    },
  })

  if (res.status === 401) {
    // Token stale — clear cache and retry once
    cachedToken = null
    return r365Get(endpoint, params)
  }

  if (!res.ok) {
    throw new Error(`R365 API ${endpoint} returned ${res.status}: ${await res.text()}`)
  }

  return res.json()
}

// ── Paginated Fetcher ─────────────────────────────────────────────

async function fetchAllPages(endpoint: string, params: Record<string, any> = {}): Promise<any[]> {
  const results: any[] = []
  let page = 1
  const pageSize = 500

  while (true) {
    const data = await r365Get(endpoint, { ...params, page, pageSize })
    const items = data.data ?? data.items ?? data ?? []
    results.push(...items)

    const total      = data.totalCount ?? data.total ?? items.length
    const fetched    = page * pageSize
    if (fetched >= total || items.length < pageSize) break
    page++
  }

  return results
}

// ── Locations ────────────────────────────────────────────────────

export async function fetchR365Locations(): Promise<any[]> {
  const items = await fetchAllPages('/locations')
  return items.map(loc => ({
    r365_id:       String(loc.locationId ?? loc.id),
    name:          loc.locationName ?? loc.name ?? '',
    number:        loc.locationNumber ?? loc.storeNumber ?? null,
    address:       loc.address?.street ?? loc.address ?? null,
    city:          loc.address?.city ?? loc.city ?? null,
    state:         loc.address?.state ?? loc.state ?? null,
    zip:           loc.address?.zip ?? loc.zip ?? null,
    phone:         loc.phone ?? null,
    brand_slug:    detectBrand(loc.locationName ?? loc.name ?? ''),
    status:        loc.isActive ? 'open' : 'closed',
  }))
}

// ── Daily Sales ──────────────────────────────────────────────────

export async function fetchR365DailySales(
  startDate: string,
  endDate: string,
  r365LocationId?: string
): Promise<any[]> {
  const params: Record<string, any> = { startDate, endDate }
  if (r365LocationId) params.locationId = r365LocationId

  const items = await fetchAllPages('/salesSummary', params)

  return items.map(item => ({
    r365_location_id:  String(item.locationId ?? item.id),
    business_date:     item.businessDate ?? item.date,
    net_sales:         Number(item.netSales ?? item.totalSales ?? 0),
    gross_sales:       Number(item.grossSales ?? 0),
    transaction_count: Number(item.transactionCount ?? item.guestCount ?? 0),
    avg_check:         Number(item.averageCheck ?? item.avgCheck ?? 0),
    drive_thru_sales:  Number(item.driveThroughSales ?? item.driveThruSales ?? 0),
    delivery_sales:    Number(item.deliverySales ?? 0),
    discount_amount:   Number(item.discountAmount ?? 0),
    tax_amount:        Number(item.taxAmount ?? 0),
    void_amount:       Number(item.voidAmount ?? 0),
  }))
}

// ── Transactions ─────────────────────────────────────────────────

export async function fetchR365Transactions(
  startDate: string,
  endDate: string,
  r365LocationId?: string
): Promise<any[]> {
  const params: Record<string, any> = { startDate, endDate }
  if (r365LocationId) params.locationId = r365LocationId

  const items = await fetchAllPages('/transactions', params)

  return items.map(item => ({
    r365_id:          String(item.transactionId ?? item.id),
    r365_location_id: String(item.locationId),
    business_date:    item.businessDate ?? item.date,
    transaction_time: item.transactionDateTime ?? item.transactionTime ?? null,
    amount:           Number(item.netSales ?? item.totalAmount ?? item.amount ?? 0),
    item_count:       Number(item.itemCount ?? 0),
    payment_type:     item.paymentType ?? item.tenderType ?? null,
    order_type:       item.orderType ?? item.salesChannel ?? null,
    void_flag:        Boolean(item.isVoid ?? item.voidFlag ?? false),
    discount_amount:  Number(item.discountAmount ?? 0),
    tax_amount:       Number(item.taxAmount ?? 0),
  }))
}

// ── Labor ────────────────────────────────────────────────────────

export async function fetchR365Labor(
  startDate: string,
  endDate: string
): Promise<any[]> {
  const items = await fetchAllPages('/labor/summary', { startDate, endDate })

  return items.map(item => ({
    r365_location_id: String(item.locationId ?? item.id),
    business_date:    item.businessDate ?? item.date,
    total_hours:      Number(item.totalHours ?? item.hours ?? 0),
    regular_hours:    Number(item.regularHours ?? 0),
    overtime_hours:   Number(item.overtimeHours ?? 0),
    total_cost:       Number(item.totalLaborCost ?? item.laborCost ?? item.cost ?? 0),
    regular_cost:     Number(item.regularCost ?? 0),
    overtime_cost:    Number(item.overtimeCost ?? 0),
    employee_count:   Number(item.employeeCount ?? 0),
  }))
}

// ── Food Cost ────────────────────────────────────────────────────

export async function fetchR365FoodCost(
  startDate: string,
  endDate: string
): Promise<any[]> {
  const items = await fetchAllPages('/foodCost/summary', { startDate, endDate })

  return items.map(item => ({
    r365_location_id: String(item.locationId ?? item.id),
    business_date:    item.businessDate ?? item.date,
    total_cogs:       Number(item.totalCost ?? item.cogs ?? item.foodCost ?? 0),
    food_cost:        Number(item.foodCost ?? 0),
    beverage_cost:    Number(item.beverageCost ?? 0),
    paper_cost:       Number(item.paperCost ?? 0),
    waste_amount:     Number(item.wasteAmount ?? item.waste ?? 0),
    variance:         Number(item.variance ?? item.inventoryVariance ?? 0),
  }))
}

// ── AP / Expenses ────────────────────────────────────────────────

export async function fetchR365Expenses(
  startDate: string,
  endDate: string
): Promise<any[]> {
  const items = await fetchAllPages('/apInvoices', { startDate, endDate })

  return items.map(item => ({
    r365_id:          String(item.invoiceId ?? item.id),
    r365_location_id: String(item.locationId),
    invoice_date:     item.invoiceDate ?? item.date,
    due_date:         item.dueDate ?? null,
    vendor_name:      item.vendorName ?? 'Unknown',
    vendor_id:        item.vendorId ? String(item.vendorId) : null,
    category:         item.glCategoryName ?? item.expenseCategory ?? 'Uncategorized',
    gl_account:       item.glAccountName ?? null,
    amount:           Number(item.invoiceAmount ?? item.amount ?? 0),
    status:           item.status ?? 'pending',
    description:      item.description ?? null,
  }))
}
