import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission, requireAdminOrSuper } from '@/lib/permissions'

export async function GET() {
  try {
    try {
      await requireAdminOrSuper()
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Unauthorized'
      return NextResponse.json({ error: msg }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    try {
      await requirePermission('product_create')
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Unauthorized'
      // Forbidden vs Unauthorized
      const status = msg === 'Forbidden' ? 403 : 401
      return NextResponse.json({ error: msg }, { status })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      price,
      comparePrice,
      sku,
      categoryId,
      isActive,
      isFeatured,
      isNew,
      variants,
      images
    } = body

    // Generate unique slug if not provided
    let finalSlug = slug
    if (!finalSlug) {
      finalSlug = name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: finalSlug }
    })

    if (existingProduct) {
      finalSlug = `${finalSlug}-${Date.now()}`
    }

    // Ensure SKU is unique; generate robust fallback
    const generateSku = () => `STR-${Date.now()}-${Math.floor(Math.random()*100000)}`
    let finalSku = sku && sku.trim() ? sku.trim() : generateSku()
    // If provided SKU already exists, append suffix
    const existingSku = await prisma.product.findUnique({ where: { sku: finalSku } })
    if (existingSku) {
      finalSku = `${finalSku}-${Date.now()}`
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description,
        price,
        comparePrice,
        sku: finalSku,
        categoryId,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isNew: isNew ?? true,
        variants: {
          create: (Array.isArray(variants) ? variants.map((v: any) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock,
            sku: v.sku
          })) : [])
        },
        images: {
          create: images?.map((url: string, index: number) => ({
            url,
            alt: name,
            sortOrder: index
          })) || []
        }
      },
      include: {
        category: true,
        variants: true,
        images: true
      }
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    const message = error instanceof Error ? error.message : 'Failed to create product'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
