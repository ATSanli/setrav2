import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } })

    const header = 'id,email,createdAt\n'
    const rows = subs.map((s) => `${s.id},${s.email},${s.createdAt.toISOString()}`).join('\n')
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
