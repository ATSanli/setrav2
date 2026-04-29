import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const favs = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: { product: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } } } },
      orderBy: { createdAt: 'desc' }
    })

    const items = favs.map(f => ({
      id: f.id,
      productId: f.productId,
      name: f.product?.name || 'Ürün',
      image: f.product?.images?.[0]?.url || '/images/placeholder.jpg',
      price: Number(f.product?.price || 0)
    }))

    return NextResponse.json({ items })
  } catch (error: any) {
    console.error('Favorites GET error:', error)
    const message = error?.message || String(error) || 'Server error'
    return NextResponse.json({ error: message, items: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const productId = String(body?.productId || '')
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

    // ensure product exists
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, isActive: true } })
    if (!product || !product.isActive) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    // prevent duplicates
    const existing = await prisma.favorite.findFirst({ where: { userId: session.user.id, productId } })
    if (existing) return NextResponse.json({ success: true, id: existing.id })

    const favorite = await prisma.favorite.create({ data: { userId: session.user.id, productId } })
    return NextResponse.json({ success: true, id: favorite.id })
  } catch (error) {
    console.error('Favorites POST error:', error)
    const message = (error as any)?.message || String(error) || 'Failed to add favorite'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
