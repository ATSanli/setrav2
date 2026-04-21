import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest, { params }: { params: { id?: string } }) {
  try {
    const id = params?.id
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id parameter' }, { status: 400 })
    }

    try {
      await prisma.newsletterSubscriber.delete({ where: { id } })
      return NextResponse.json({ success: true })
    } catch (e: any) {
      // Prisma error when record not found
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
