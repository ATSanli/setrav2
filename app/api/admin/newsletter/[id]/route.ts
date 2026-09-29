import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminApiAccess } from '@/lib/admin-api-auth'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = await adminApiAccess()
  if (denied) return denied
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id parameter in path' }, { status: 400 })
    }

    try {
      // ID is expected to be a string (cuid/uuid). Do not cast to number.
      await prisma.newsletterSubscriber.update({
        where: { id },
        data: { isActive: false, unsubscribedAt: new Date() }
      })
      return NextResponse.json({ success: true })
    } catch (e: any) {
      const code = e?.code
      if (code === 'P2025') {
        return NextResponse.json({ success: false, error: 'Subscriber not found' }, { status: 404 })
      }
      console.error('Admin newsletter delete prisma error:', e)
      return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 })
    }
  } catch (error) {
    console.error('Admin newsletter delete error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
