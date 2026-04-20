import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
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

    // Build update data only from provided fields to allow partial updates (e.g., toggling isBestSeller)
    const upData: any = {}
    const allowedFields = ['name','slug','description','price','comparePrice','sku','categoryId','isActive','isFeatured','isNew','isBestSeller']
    for (const f of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, f)) upData[f] = body[f]
    }

    let updated
    try {
      updated = await prisma.product.update({ where: { id }, data: upData })
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = (err.meta as any)?.target
        const fields = Array.isArray(target) ? target.join(', ') : target
        return NextResponse.json({ error: `Unique constraint failed on the fields: (${fields})` }, { status: 409 })
      }
      throw err
    }

    // 🔥 VARIANTS RESET (only if provided)
    if (Object.prototype.hasOwnProperty.call(body, 'variants')) {
      await prisma.productVariant.deleteMany({ where: { productId: id } })
      const variants = body.variants
      if (Array.isArray(variants) && variants.length > 0) {
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i]
          let variantSku = v.sku && v.sku.trim() ? v.sku.trim() : `${id}-V${i}-${Math.floor(Math.random() * 10000)}`
          while (await prisma.productVariant.findUnique({ where: { sku: variantSku } })) {
            variantSku = `${variantSku}-${Math.floor(Math.random() * 1000)}`
          }
          await prisma.productVariant.create({
            data: {
              productId: id,
              size: v.size,
              color: v.color,
              colorHex: v.colorHex,
              stock: v.stock,
              sku: variantSku
            }
          })
        }
      }
    }

    // 🔥 IMAGES RESET (only if provided)
    if (Object.prototype.hasOwnProperty.call(body, 'images')) {
      await prisma.productImage.deleteMany({ where: { productId: id } })
      const images = body.images
      if (Array.isArray(images) && images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((url: string, i: number) => ({
            productId: id,
            url,
            alt: body.name || '',
            sortOrder: i
          }))
        })
      }
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