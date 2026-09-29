import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function ownedItem(itemId: string) {
  const session = await getServerSession(authOptions)
  const sessionId = (await cookies()).get('cart_session')?.value
  if (!session?.user?.id && !sessionId) return null
  return prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cart: session?.user?.id ? { userId: session.user.id } : { sessionId }
    },
    include: { product: { include: { category: { select: { isActive: true } } } }, variant: true }
  })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params
    const item = await ownedItem(itemId)
    if (!item) return NextResponse.json({ error: 'Sepet ürünü bulunamadı' }, { status: 404 })
    const { quantity } = await request.json()
    if (!Number.isInteger(quantity) || quantity < 1) return NextResponse.json({ error: 'Geçersiz adet' }, { status: 400 })
    if (!item.product.isActive || !item.product.category.isActive || item.product.source === 'TRENDYOL' || item.variant.productId !== item.productId) {
      return NextResponse.json({ error: 'Ürün artık satışta değil' }, { status: 409 })
    }
    if (quantity > item.variant.stock) return NextResponse.json({ error: 'Yetersiz stok' }, { status: 400 })
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart item PATCH error:', error)
    return NextResponse.json({ error: 'Sepet güncellenemedi' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params
    const item = await ownedItem(itemId)
    if (!item) return NextResponse.json({ error: 'Sepet ürünü bulunamadı' }, { status: 404 })
    await prisma.cartItem.delete({ where: { id: item.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart item DELETE error:', error)
    return NextResponse.json({ error: 'Sepet ürünü silinemedi' }, { status: 500 })
  }
}
