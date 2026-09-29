import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions, isAdmin } from '@/lib/auth'

export async function adminApiAccess() {
  const session = await getServerSession(authOptions)
  if (!session) {
    console.warn('ADMIN_AUTH_REJECT', 'HANDLER_SESSION_MISSING')
    return { session: null, denied: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (!isAdmin(session.user.role)) {
    console.warn('ADMIN_AUTH_REJECT', 'HANDLER_ROLE_REQUIRED')
    return { session: null, denied: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { session, denied: null }
}
