import { NextRequest } from 'next/server'
import { streamChat } from '@/lib/ai'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const { messages, days = 30 } = await req.json()

  if (!messages || !Array.isArray(messages)) {
    return new Response('Invalid messages', { status: 400 })
  }

  try {
    const stream = await streamChat(messages, days)

    // Stream the response as Server-Sent Events
    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({ text: event.delta.text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (e) {
          controller.error(e)
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      },
    })
  } catch (e: any) {
    console.error('[API/ai/chat]', e)
    return new Response(JSON.stringify({ error: e.message }), {
      status:  500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
