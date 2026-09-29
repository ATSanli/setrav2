import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminApiAccess } from '@/lib/admin-api-auth'

export async function GET() {
  const { denied } = await adminApiAccess()
  if (denied) return denied
  try {
    const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } })

    const header = 'id,email,status,createdAt,unsubscribedAt\n'
    const rows = subs.map((s) => `${s.id},${s.email},${s.isActive ? 'active' : 'inactive'},${s.createdAt.toISOString()},${s.unsubscribedAt?.toISOString() || ''}`).join('\n')
    const csv = header + rows

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="newsletter_subscribers.csv"'
      }
    })
  } catch (error) {
    console.error('Export CSV error:', error)
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 })
  }
}
