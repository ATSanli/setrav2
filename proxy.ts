import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { findAdminSessionCookieName } from '@/lib/admin-session-cookie'

function rejectAdminAuth(code: 'AUTH_SECRET_MISSING' | 'SESSION_COOKIE_MISSING' | 'SESSION_TOKEN_INVALID' | 'ADMIN_ROLE_REQUIRED') {
  console.warn('ADMIN_AUTH_REJECT', code)
  const status = code === 'AUTH_SECRET_MISSING' ? 503 : code === 'ADMIN_ROLE_REQUIRED' ? 403 : 401
  return NextResponse.json({ error: status === 403 ? 'Forbidden' : status === 503 ? 'Service unavailable' : 'Unauthorized' }, { status })
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]
  if (host === 'www.setraofficial.com' || request.nextUrl.hostname === 'www.setraofficial.com') {
    const url = request.nextUrl.clone()
    url.hostname = 'setraofficial.com'
    url.protocol = 'https:'
    return NextResponse.redirect(url, 308)
  }
  if (request.nextUrl.pathname.startsWith('/api/admin/') || ['/api/users', '/api/upload'].includes(request.nextUrl.pathname)) {
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    if (!secret) return rejectAdminAuth('AUTH_SECRET_MISSING')
    // NextAuth names this cookie from the request origin. getToken's default uses
    // NEXTAUTH_URL/VERCEL instead, which can differ behind a production proxy.
    const cookieNames = request.cookies.getAll().map(cookie => cookie.name)
    const cookieName = findAdminSessionCookieName(cookieNames)
    if (!cookieName) return rejectAdminAuth('SESSION_COOKIE_MISSING')
    let token
    try {
      token = await getToken({ req: request, secret, cookieName })
    } catch {
      return rejectAdminAuth('SESSION_TOKEN_INVALID')
    }
    if (!token) return rejectAdminAuth('SESSION_TOKEN_INVALID')
    if (!['ADMIN', 'SUPER_ADMIN'].includes(String(token.role))) return rejectAdminAuth('ADMIN_ROLE_REQUIRED')
  }
  return NextResponse.next()
}
