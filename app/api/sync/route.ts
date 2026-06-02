import { NextRequest, NextResponse } from 'next/server'
import { runFullSync, syncLocations } from '@/lib/sync'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { type = 'full', days = 7 } = await req.json().catch(() => ({}))

  try {
    if (type === 'locations') {
      const result = await syncLocations()
      return NextResponse.json({ success: true, result })
    }

    const result = await runFullSync(days)
    return NextResponse.json({ success: true, result })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
