import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminOrSuper } from '@/lib/permissions'

export async function GET() {
  try {
    await requireAdminOrSuper()

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json({ categories })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    try {
      await requireAdminOrSuper()
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Unauthorized'
      return NextResponse.json({ error: msg }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, image, parentId, isActive, sortOrder } = body

    // Normalize image field: accept string or Cloudinary-like object
    const imageValue =
      typeof image === 'string'
        ? image
        : image?.url ?? image?.secure_url ?? image?.path ?? null

    // Generate slug if not provided
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

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        image: imageValue,
        parentId,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0
      }
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    const message = error instanceof Error ? error.message : 'Failed to create category'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
