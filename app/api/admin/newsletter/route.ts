import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminApiAccess } from '@/lib/admin-api-auth'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const { denied } = await adminApiAccess()
  if (denied) return denied
  try {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')
    const page = Math.max(1, Math.floor(Number(url.searchParams.get('page')) || 1))
    const pageSize = Math.min(100, Math.max(1, Math.floor(Number(url.searchParams.get('pageSize')) || 20)))
    const status = url.searchParams.get('status')

    const where: Prisma.NewsletterSubscriberWhereInput = {
      ...(q ? { email: { contains: q.trim(), mode: 'insensitive' } } : {}),
      ...(status === 'active' ? { isActive: true } : status === 'inactive' ? { isActive: false } : {})
    }

    const [total, subscribers] = await Promise.all([
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ])

    return NextResponse.json({ success: true, subscribers, total, page, pageSize })
  } catch (error) {
    console.error('Admin newsletter list error:', error)
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 })
  }
}
