import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]
  if (host === 'www.setraofficial.com' || request.nextUrl.hostname === 'www.setraofficial.com') {
    const url = request.nextUrl.clone()
    url.hostname = 'setraofficial.com'
    url.protocol = 'https:'
    return NextResponse.redirect(url, 308)
  }
  if (request.nextUrl.pathname.startsWith('/api/admin/') || ['/api/users', '/api/upload'].includes(request.nextUrl.pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'SUPER_ADMIN'].includes(String(token.role))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.next()
}
