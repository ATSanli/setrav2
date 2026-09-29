import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions, isAdmin } from '@/lib/auth'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!isAdmin(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const url = new URL(request.url)
    const q = url.searchParams.get('q')
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') || '20') || 20))

    const where: Prisma.NewsletterSubscriberWhereInput = q ? { email: { contains: q, mode: 'insensitive' } } : {}

    const [total, subscribers] = await Promise.all([
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Math.max(1, page) - 1) * pageSize,
        take: pageSize
      })
    ])

    return NextResponse.json({ success: true, subscribers, total, page, pageSize })
  } catch (error) {
    console.error('Admin newsletter list error:', error)
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 })
  }
}
