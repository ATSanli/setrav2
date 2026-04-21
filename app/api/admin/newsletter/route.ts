import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')

    const where = q
      ? { where: { email: { contains: q, mode: 'insensitive' } }, orderBy: { createdAt: 'desc' } }
      : { orderBy: { createdAt: 'desc' } }

    const subscribers = await prisma.newsletterSubscriber.findMany(where as any)

    return NextResponse.json({ success: true, subscribers })
  } catch (error) {
    console.error('Admin newsletter list error:', error)
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 })
  }
}
