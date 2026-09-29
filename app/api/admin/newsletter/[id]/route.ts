import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions, isAdmin } from '@/lib/auth'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!isAdmin(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
