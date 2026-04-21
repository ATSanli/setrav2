import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function PATCH(request: NextRequest, { params }: { params: any }) {
  try {
    await requirePermission('order_manage')

    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const body = await request.json()
    const { status, cancelReason } = body || {}

    const allowed = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED']
    if (!status || typeof status !== 'string' || !allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const data: any = { status }
    if (status === 'CANCELLED' && typeof cancelReason === 'string' && cancelReason.trim()) {
      // store cancellation reason in note field alongside existing notes
      data.note = cancelReason
    }

    const updated = await prisma.order.update({ where: { id }, data })

    return NextResponse.json({ order: updated })
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : 'Failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
