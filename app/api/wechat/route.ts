import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const TOKEN = process.env.WECHAT_TOKEN || 'dhulF'
const ENCODING_AES_KEY = process.env.WECHAT_AES_KEY || '4tYc3o4uIF7aiOSLCtgtuJvhzGgGBH3lNAL2AJnrfM4'
const CORP_ID = process.env.WECHAT_CORP_ID || 'ww09d931ceac2bea1b'
const PIKA_WEBHOOK = process.env.PIKA_WEBHOOK_URL || ''

// Verify WeChat signature
function verifySignature(signature: string, timestamp: string, nonce: string): boolean {
  const arr = [TOKEN, timestamp, nonce].sort()
  const str = arr.join('')
  const hash = crypto.createHash('sha1').update(str).digest('hex')
  return hash === signature
}

// Handle GET - WeChat URL verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const signature = searchParams.get('msg_signature') || searchParams.get('signature') || ''
  const timestamp = searchParams.get('timestamp') || ''
  const nonce = searchParams.get('nonce') || ''
  const echostr = searchParams.get('echostr') || ''

  console.log('Verification request:', { signature, timestamp, nonce, echostr })

  if (verifySignature(signature, timestamp, nonce)) {
    return new NextResponse(echostr, { status: 200 })
  }
  return new NextResponse('Verification failed', { status: 403 })
}

// Handle POST - Receive messages
export async function POST(request: NextRequest) {
  const body = await request.text()
  console.log('Received message:', body)

  // Forward to Pika webhook if configured
  if (PIKA_WEBHOOK) {
    try {
      await fetch(PIKA_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: body
      })
    } catch (e) {
      console.error('Failed to forward to Pika:', e)
    }
  }

  return new NextResponse('success', { status: 200 })
}
