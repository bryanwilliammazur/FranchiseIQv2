import { NextRequest, NextResponse } from 'next/server'
import { generateDynamicView } from '@/lib/ai'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const { query } = await req.json()

  if (!query?.trim()) {
    return NextResponse.json({ success: false, error: 'Query required' }, { status: 400 })
  }

  try {
    const view = await generateDynamicView(query)
    return NextResponse.json({ success: true, view })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
