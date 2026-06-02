import { NextRequest, NextResponse } from 'next/server'
import { getPortfolioSummary, getTotalKPIs, getDailyTrend, getTopLocations } from '@/lib/queries'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const days  = parseInt(searchParams.get('days')  ?? '30')
  const brand = searchParams.get('brand') ?? 'all'

  try {
    const [kpis, portfolio, trend, topLocations] = await Promise.all([
      getTotalKPIs(days),
      getPortfolioSummary(days),
      getDailyTrend(days, brand),
      getTopLocations(10, brand),
    ])

    return NextResponse.json({ success: true, kpis, portfolio, trend, topLocations })
  } catch (e: any) {
    console.error('[API/sales]', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
