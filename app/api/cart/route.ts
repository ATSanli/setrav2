import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// Get or create cart
async function getOrCreateCart(userId?: string) {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get('cart_session')?.value

  if (userId) {
    // User is logged in - find or create user cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { sortOrder: 'asc' } }
              }
            },
            variant: true
          }
        }
      }
    })

    if (!cart) {
      // Check if there's a guest cart to merge
      if (sessionId) {
        const guestCart = await prisma.cart.findUnique({
          where: { sessionId },
          include: { items: true }
        })

        if (guestCart) {
          // Create user cart with guest items
          cart = await prisma.cart.create({
            data: {
              userId,
              items: {
                create: guestCart.items.map(item => ({
                  productId: item.productId,
                  variantId: item.variantId,
                  quantity: item.quantity
                }))
              }
            },
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      images: { take: 1, orderBy: { sortOrder: 'asc' } }
                    }
                  },
                  variant: true
                }
              }
            }
          })

          // Delete guest cart
          await prisma.cart.delete({ where: { id: guestCart.id } })
        } else {
          cart = await prisma.cart.create({
            data: { userId },
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      images: { take: 1, orderBy: { sortOrder: 'asc' } }
                    }
                  },
                  variant: true
                }
              }
            }
          })
        }
      } else {
        cart = await prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: { take: 1, orderBy: { sortOrder: 'asc' } }
                  }
                },
                variant: true
              }
            }
          }
        })
      }
    }

    return cart
  } else {
    // Guest user
    if (!sessionId) {
      sessionId = uuidv4()
      cookieStore.set('cart_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })
    }

    let cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { sortOrder: 'asc' } }
              }
            },
            variant: true
          }
        }
      }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1, orderBy: { sortOrder: 'asc' } }
                }
              },
              variant: true
            }
          }
        }
      })
    }

    return cart
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const cart = await getOrCreateCart(session?.user?.id)

    const items = cart.items.map(item => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product.name,
      image: item.product.images[0]?.url || '/images/placeholder.jpg',
      size: item.variant.size,
      color: item.variant.color,
      price: Number(item.product.price),
      quantity: item.quantity,
      stock: item.variant.stock
    }))

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const couponCode = cart.couponCode || null
    const discount = Number(cart.discount ?? 0)

    return NextResponse.json({ items, subtotal, itemCount, couponCode, discount })
  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json({ items: [], subtotal: 0, itemCount: 0 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    // If body contains couponCode, apply coupon to cart
    if (body?.couponCode) {
      const couponCode = String(body.couponCode).trim()
      const cart = await getOrCreateCart(session?.user?.id)

      // validate coupon
      let coupon = await prisma.coupon.findFirst({
        where: { code: { equals: couponCode, mode: 'insensitive' }, active: true }
      })

      // If coupon not found, handle SETRA10 fallback and auto-create logic
      if (!coupon) {
        if (couponCode.toUpperCase() === 'SETRA10') {
          try {
            // Try to create the coupon in DB so future requests use DB entry
            coupon = await prisma.coupon.create({
              data: {
                code: 'SETRA10',
                name: 'SETRA10',
                type: 'PERCENT',
                value: 10,
                active: true
              }
            })
          } catch (createErr) {
            // If create fails (e.g., table missing or DB issue), log details and fall back to manual 10% discount
            console.log('Hata detayı:', createErr)
            const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
            const discount = Math.round((subtotal * 0.1) * 100) / 100
            try {
              await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: 'SETRA10', discount } })
            } catch (updateErr) {
              console.log('Hata detayı:', updateErr)
            }
            return NextResponse.json({ success: true, coupon: 'SETRA10', discount })
          }
        } else {
          return NextResponse.json({ success: false, error: 'Invalid coupon' }, { status: 400 })
        }
      }

      // calculate subtotal
      const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
      let discount = 0
      if (coupon.type === 'PERCENT') {
        discount = Math.round((subtotal * (coupon.value / 100)) * 100) / 100
      } else {
        discount = coupon.value
      }

      await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: coupon.code, discount } })

      return NextResponse.json({ success: true, coupon: coupon.code, discount })
    }

    const { productId, variantId, quantity = 1 } = body

    if (!productId || !variantId) {
      return NextResponse.json(
        { error: 'Product and variant are required' },
        { status: 400 }
      )
    }

    const cart = await getOrCreateCart(session?.user?.id)

    // Check if item already exists
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId
        }
      }
    })

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      })
    } else {
      // Create new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart POST error:', error)
    console.log('Hata detayı:', error)
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    const cart = await getOrCreateCart(session?.user?.id)

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
