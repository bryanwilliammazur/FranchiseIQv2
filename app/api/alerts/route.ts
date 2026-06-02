import { NextResponse } from 'next/server'
import { getActiveAlerts } from '@/lib/queries'
import { sql } from '@/lib/db'

export async function GET() {
  const alerts = await getActiveAlerts(50)
  return NextResponse.json({ success: true, alerts })
}

export async function PATCH(req: Request) {
  const { id } = await req.json()
  await sql`UPDATE alerts SET resolved = true, resolved_at = NOW() WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
