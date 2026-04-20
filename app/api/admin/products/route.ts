import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
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

    // Ensure SKU is unique; generate robust fallback and guard against collisions
    const generateSku = () => `STR-${Date.now()}-${Math.floor(Math.random() * 100000)}`
    let finalSku = sku && sku.trim() ? sku.trim() : generateSku()
    // If provided SKU already exists, try appending a small random suffix until unique
    while (await prisma.product.findUnique({ where: { sku: finalSku } })) {
      finalSku = `${finalSku}-${Math.floor(Math.random() * 10000)}`
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
          create: (Array.isArray(variants) ? await Promise.all(variants.map(async (v: any, idx: number) => {
            // ensure each variant has a sku; if missing generate one and avoid collisions
            let variantSku = v.sku && v.sku.trim() ? v.sku.trim() : `${finalSku}-V${idx}-${Math.floor(Math.random() * 10000)}`
            while (await prisma.productVariant.findUnique({ where: { sku: variantSku } })) {
              variantSku = `${variantSku}-${Math.floor(Math.random() * 1000)}`
            }
            return {
              size: v.size,
              color: v.color,
              colorHex: v.colorHex,
              stock: v.stock,
              sku: variantSku
            }
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
    // Prisma unique constraint error (P2002)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta as any)?.target
      const fields = Array.isArray(target) ? target.join(', ') : target
      return NextResponse.json({ error: `Unique constraint failed on the fields: (${fields})` }, { status: 409 })
    }

    const message = error instanceof Error ? error.message : 'Failed to create product'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
