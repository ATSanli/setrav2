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

    if (target === 'CANCELLED') {
      const result = await prisma.$transaction(async tx => {
        const changed = await tx.order.updateMany({ where: { id, status: { not: 'CANCELLED' } }, data })
        if (changed.count === 0) return { changed: false, order: await tx.order.findUnique({ where: { id } }) }
        for (const item of existing.items) {
          if (item.trendyolReserved) {
            const [variant] = await tx.$queryRaw<{ remoteStock: number | null; localStockDelta: number; trendyolStatus: string | null }[]>`SELECT "remoteStock", "localStockDelta", "trendyolStatus" FROM "product_variants" WHERE "id" = ${item.variantId} FOR UPDATE`
            if (!variant) throw new Error('Sipariş varyantı bulunamadı')
            const localStockDelta = variant.localStockDelta + item.quantity
            await tx.productVariant.update({ where: { id: item.variantId }, data: {
              localStockDelta,
              stock: variant.trendyolStatus === 'onSale' ? Math.max(0, (variant.remoteStock ?? 0) + localStockDelta) : 0
            } })
          } else {
            await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } })
          }
        }
        return { changed: true, order: await tx.order.findUnique({ where: { id } }) }
      })
      return NextResponse.json({ order: result.order, message: result.changed ? 'Sipariş iptal edildi ve stoklar güncellendi' : 'Sipariş zaten iptal edilmiş' })
    }

    // Non-cancel status transitions: simple update
    const updated = await prisma.order.update({ where: { id }, data })
    return NextResponse.json({ order: updated })
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : 'Failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
