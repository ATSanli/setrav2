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

    // 🔥 VARIANTS UPSERT (preserve IDs used in orders)
    // Use upsert per-variant instead of deleting all variants. For variants
    // omitted from the payload we attempt to delete them; if deletion fails
    // due to FK constraints, return a friendly error advising to deactivate.
    if (Object.prototype.hasOwnProperty.call(body, 'variants')) {
      const variants = body.variants
      if (Array.isArray(variants)) {
        // Fetch existing variants for this product
        const existing = await prisma.productVariant.findMany({ where: { productId: id } })
        const toKeepOrCreate: string[] = [] // track skus/ids to keep

        for (let i = 0; i < variants.length; i++) {
          const v = variants[i]
          // Prefer id for matching, fall back to sku
          let where: any = undefined
          if (v.id) where = { id: v.id }
          else if (v.sku && v.sku.trim()) where = { sku: v.sku.trim() }

          // Ensure we have a SKU to use for uniqueness
          let variantSku = v.sku && v.sku.trim() ? v.sku.trim() : `${id}-V${i}-${Math.floor(Math.random() * 10000)}`
          while (!v.id && await prisma.productVariant.findUnique({ where: { sku: variantSku } }) && !(where && where.sku === variantSku)) {
            variantSku = `${variantSku}-${Math.floor(Math.random() * 1000)}`
          }

          // Build upsert where clause: if we have id use that, otherwise use sku
          const upsertWhere = where ?? { sku: variantSku }

          try {
            await prisma.productVariant.upsert({
              where: upsertWhere,
              update: {
                size: v.size,
                color: v.color,
                colorHex: v.colorHex,
                // Overwrite stock with provided value
                stock: Number(v.stock ?? 0),
                sku: variantSku,
                productId: id
              },
              create: {
                productId: id,
                size: v.size,
                color: v.color,
                colorHex: v.colorHex,
                stock: Number(v.stock ?? 0),
                sku: variantSku
              }
            })
          } catch (err: any) {
            // If upsert fails due to unique constraint on SKU, generate a new SKU and retry once
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
              variantSku = `${variantSku}-${Math.floor(Math.random() * 1000)}`
              await prisma.productVariant.upsert({
                where: { sku: variantSku },
                update: {
                  size: v.size,
                  color: v.color,
                  colorHex: v.colorHex,
                  stock: Number(v.stock ?? 0),
                  sku: variantSku,
                  productId: id
                },
                create: {
                  productId: id,
                  size: v.size,
                  color: v.color,
                  colorHex: v.colorHex,
                  stock: Number(v.stock ?? 0),
                  sku: variantSku
                }
              })
            } else {
              throw err
            }
          }

          // track by id if provided else sku
          if (v.id) toKeepOrCreate.push(v.id)
          else toKeepOrCreate.push(variantSku)
        }

        // Determine which existing variants were removed in payload
        const existingIds = existing.map((e) => e.id)
        const removed = existing.filter((e) => !toKeepOrCreate.includes(e.id) && !toKeepOrCreate.includes(e.sku))

        if (removed.length > 0) {
          try {
            // Attempt to delete removed variants
            await prisma.productVariant.deleteMany({ where: { id: { in: removed.map(r => r.id) } } })
          } catch (err: any) {
            // Foreign key constraint (orders referencing variant) will raise P2003
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
              // Inform client that deletion failed due to existing orders; advise deactivation
              return NextResponse.json({ error: 'Some variants could not be deleted because they are referenced by existing orders. Mark them inactive instead.' }, { status: 400 })
            }
            throw err
          }
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