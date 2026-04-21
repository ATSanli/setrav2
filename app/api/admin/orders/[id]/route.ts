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

    // fetch existing order with items
    const existing = await prisma.order.findUnique({ where: { id }, include: { items: true } })
    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const target = status
    const data: any = { status: target }
    if ((target === 'CANCELLED' || target === 'REJECTED') && typeof cancelReason === 'string' && cancelReason.trim()) {
      data.note = cancelReason
    }

    // If transitioning to CANCELLED/REJECTED, and order was NOT already CANCELLED,
    // we should return stock for each order item by incrementing the related variant's stock.
    if (target === 'CANCELLED' || target === 'REJECTED') {
      if (existing.status !== 'CANCELLED') {
        // build transaction: update order, and update each variant stock
        const ops: any[] = []
        ops.push(prisma.order.update({ where: { id }, data }))

        for (const item of existing.items) {
          if (item.variantId) {
            ops.push(
              prisma.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } }
              })
            )
          }
        }

        const results = await prisma.$transaction(ops)
        const updatedOrder = results[0]
        return NextResponse.json({ order: updatedOrder, message: 'Sipariş iptal edildi ve stoklar güncellendi' })
      } else {
        // already cancelled — do not increment stocks again
        const updated = await prisma.order.update({ where: { id }, data })
        return NextResponse.json({ order: updated, message: 'Sipariş zaten iptal edilmiş; stok güncellemesi yapılmadı' })
      }
    }

    // Non-cancel status transitions: simple update
    const updated = await prisma.order.update({ where: { id }, data })
    return NextResponse.json({ order: updated })
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : 'Failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
