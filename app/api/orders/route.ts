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
            product: true,
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
      if (item.variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `${item.product.name}${translations.tr.insufficient_stock_suffix}` },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    )
    const shippingCost = subtotal >= 500 ? 0 : 29.90
    const total = subtotal + shippingCost

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
          total,
          note,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.product.name,
              variantInfo: `Beden: ${item.variant.size}, Renk: ${item.variant.color}`,
              price: item.product.price,
              quantity: item.quantity
            }))
          }
        }
      })

      // Update stock
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity }
          }
        })
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      })

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

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json(
      { error: translations.tr.orders_fetch_failed },
      { status: 500 }
    )
  }
}
