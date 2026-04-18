import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const featured = searchParams.get('featured') === 'true'
    const isNew = searchParams.get('new') === 'true'
    const bestseller = searchParams.get('bestseller') === 'true'
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const where: any = {
      isActive: true
    }

    if (featured) {
      where.isFeatured = true
    }

    if (isNew) {
      where.isNew = true
    }

    if (bestseller) {
      where.isBestSeller = true
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } }
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        where.price.gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice)
      }
    }

    // Determine sort order
    let orderBy: any = {}
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' }
        break
      case 'price-desc':
        orderBy = { price: 'desc' }
        break
      case 'name':
        orderBy = { name: order }
        break
      case 'bestseller':
        orderBy = { soldCount: 'desc' }
        break
      default:
        orderBy = { createdAt: order }
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          },
          images: {
            take: 2,
            orderBy: { sortOrder: 'asc' }
          },
          variants: {
            select: { id: true, color: true, colorHex: true, size: true, stock: true },
            distinct: ['color']
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', products: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 0 } },
      { status: 500 }
    )
  }
}
