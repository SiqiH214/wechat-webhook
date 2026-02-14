import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

const TOKEN = process.env.WECHAT_TOKEN || 'dhulF'

function verifySignature(signature: string, timestamp: string, nonce: string): boolean {
  const arr = [TOKEN, timestamp, nonce].sort()
  const str = arr.join('')
  const hash = createHash('sha1').update(str).digest('hex')
  return hash === signature
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const signature = searchParams.get('msg_signature') || searchParams.get('signature') || ''
  const timestamp = searchParams.get('timestamp') || ''
  const nonce = searchParams.get('nonce') || ''
  const echostr = searchParams.get('echostr') || ''

  if (verifySignature(signature, timestamp, nonce)) {
    return new NextResponse(echostr, { status: 200 })
  }
  return new NextResponse('Verification failed', { status: 403 })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  console.log('Received:', body)
  return new NextResponse('success', { status: 200 })
}
