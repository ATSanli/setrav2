import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission, requireAdminOrSuper } from '@/lib/permissions'

// ✅ GET PRODUCT
export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    await requireAdminOrSuper()

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ product })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ✅ UPDATE PRODUCT
export async function PUT(request: NextRequest, { params }: { params: any }) {
  try {
    await requirePermission('product_edit')

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
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

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price,
        comparePrice,
        sku,
        categoryId,
        isActive,
        isFeatured,
        isNew
      }
    })

    // 🔥 VARIANTS RESET
    await prisma.productVariant.deleteMany({ where: { productId: id } })

    if (Array.isArray(variants) && variants.length > 0) {
      await prisma.productVariant.createMany({
        data: variants.map((v: any) => ({
          productId: id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stock: v.stock,
          sku: v.sku
        }))
      })
    }

    // 🔥 IMAGES RESET
    await prisma.productImage.deleteMany({ where: { productId: id } })

    if (Array.isArray(images) && images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((url: string, i: number) => ({
          productId: id,
          url,
          alt: name || '',
          sortOrder: i
        }))
      })
    }

    const resp = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true, category: true }
    })

    return NextResponse.json({ product: resp })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ✅ DELETE PRODUCT (FIXED)
export async function DELETE(request: NextRequest, { params }: { params: any }) {
  try {
    await requirePermission('product_delete')

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.productVariant.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } })
    ])

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}