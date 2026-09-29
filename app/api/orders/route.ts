import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'
import { translations } from '@/translations'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { addressId, note } = await request.json()

    if (!addressId) {
      return NextResponse.json(
        { error: translations.tr.select_delivery_address },
        { status: 400 }
      )
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id
      }
    })

    if (!address) {
      return NextResponse.json(
        { error: translations.tr.invalid_address },
        { status: 400 }
      )
    }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: { include: { category: { select: { isActive: true } } } },
            variant: true
          }
        }
      }
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Check stock availability
    for (const item of cart.items) {
      if (item.product.source === 'TRENDYOL') return NextResponse.json({ error: 'Trendyol kaynaklı ürünler için SETRA siparişi kapalı' }, { status: 409 })
      if (!item.product.isActive || !item.product.category.isActive || item.variant.productId !== item.productId || item.variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `${item.product.name}${translations.tr.insufficient_stock_suffix}` },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    const subtotalCents = cart.items.reduce((sum, item) => sum + (item.variant.salePriceCents ?? Math.round(item.product.price * 100)) * item.quantity, 0)
    const subtotal = subtotalCents / 100
    const shippingCents = subtotalCents >= 50000 ? 0 : 2990
    const shippingCost = shippingCents / 100
    // Apply any cart-level discount (server-side coupon)
    const discountCents = Math.round(Number(cart.discount ?? 0) * 100)
    const discount = discountCents / 100
    const total = Math.max(0, subtotalCents + shippingCents - discountCents) / 100

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session.user.id,
          addressId,
          subtotal,
          shippingCost,
          discount,
          total,
          note,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.product.name,
              variantInfo: `Beden: ${item.variant.size}, Renk: ${item.variant.color}`,
              price: (item.variant.salePriceCents ?? Math.round(item.product.price * 100)) / 100,
              quantity: item.quantity,
              trendyolReserved: item.product.source === 'TRENDYOL'
            }))
          }
        }
      })

      // Update stock
      for (const item of cart.items) {
        const reserved = await tx.productVariant.updateMany({
          where: { id: item.variantId, productId: item.productId, stock: { gte: item.quantity }, product: { isActive: true }, ...(item.product.source === 'TRENDYOL' ? { trendyolStatus: 'onSale' } : {}) },
          data: { stock: { decrement: item.quantity }, ...(item.product.source === 'TRENDYOL' ? { localStockDelta: { decrement: item.quantity } } : {}) }
        })
        if (reserved.count !== 1) throw new Error('INSUFFICIENT_STOCK')
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      })

      // Reset cart coupon and discount
      await tx.cart.update({ where: { id: cart.id }, data: { couponCode: null, discount: 0 } })

      return newOrder
    })

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: translations.tr.order_create_failed },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 }
              }
            }
          }
        },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Sanitize and format orders to avoid hydration/serialization issues and
    // to be resilient to missing related records (deleted products, null fields)
    const sanitized = (orders as any[]).map((order) => ({
      ...order,
      // ensure numeric defaults
      discount: order.discount ?? 0,
      // couponCode might be a newly added optional field; default to null if absent
      couponCode: 'couponCode' in order ? order.couponCode ?? null : null,
      // send ISO strings to avoid Date serialization/hydration problems on client
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
      updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
      items: (order.items || []).map((item: any) => ({
        ...item,
        product: item.product ?? { id: null, name: 'Deleted product', images: [] }
      }))
    }))

    return NextResponse.json(sanitized)
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json(
      { error: translations.tr.orders_fetch_failed },
      { status: 500 }
    )
  }
}
