import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function DELETE(request: NextRequest, { params }: { params: any }) {
  try {
    await requirePermission('category_delete')
    const p = await params
    if (!p || !p.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const id = String(p.id)
    const cat = await prisma.category.findUnique({ where: { id }, include: { products: true, children: true } })
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if ((cat.products || []).length > 0) return NextResponse.json({ error: 'Category has products; cannot delete' }, { status: 400 })

    // detach children
    if ((cat.children || []).length > 0) {
      await prisma.category.updateMany({ where: { parentId: id }, data: { parentId: null } })
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : 'Failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    await requirePermission('category_view')
    const p = await params
    if (!p || !p.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const id = String(p.id)
    const cat = await prisma.category.findUnique({ where: { id }, include: { products: true, children: true } })
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ category: cat })
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : 'Failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: any }) {
  try {
    await requirePermission('category_edit')
    const p = await params
    if (!p || !p.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const id = String(p.id)
    const body = await request.json()
    const { name, slug, description, image, parentId, isActive, sortOrder } = body

    // Normalize image field: accept string or Cloudinary-like object
    const imageValue =
      typeof image === 'string'
        ? image
        : image?.url ?? image?.secure_url ?? image?.path ?? null

    // Ensure category exists
    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // If parentId is same as id, prevent
    if (parentId && parentId === id) return NextResponse.json({ error: 'Invalid parent' }, { status: 400 })

    // Generate slug if not provided
    let finalSlug = slug ?? existing.slug
    if (!finalSlug && name) {
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

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        slug: finalSlug,
        description: description ?? existing.description,
        image: imageValue ?? existing.image,
        parentId: parentId ?? null,
        isActive: typeof isActive === 'boolean' ? isActive : existing.isActive,
        sortOrder: typeof sortOrder !== 'undefined' ? Number(sortOrder) : existing.sortOrder,
      }
    })

    return NextResponse.json({ category: updated })
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : 'Failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
