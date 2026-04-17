import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminOrSuper } from '@/lib/permissions'

async function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  const rows = lines.map((l) => {
    // naive split by comma
    const parts = l.split(',')
    return {
      name: parts[0] || '',
      description: parts[1] || '',
      price: parseFloat(parts[2] || '0') || 0,
      category: parts[3] || '',
      stock: parseInt(parts[4] || '0') || 0,
      images: parts.slice(5).filter(Boolean)
    }
  })
  return rows
}

export async function POST(request: Request) {
  try {
    await requireAdminOrSuper()
    const text = await request.text()
    const rows = await parseCSV(text)
    const created = []
    for (const r of rows) {
      const category = await prisma.category.upsert({ where: { slug: r.category }, update: {}, create: { name: r.category, slug: r.category } })
      const product = await prisma.product.create({ data: {
        name: r.name,
        slug: r.name.toLowerCase().replace(/\s+/g,'-'),
        description: r.description,
        price: r.price,
        sku: `${Date.now()}-${Math.floor(Math.random()*1000)}`,
        categoryId: category.id,
        stock: r.stock
      }})
      // images handling skipped (store URLs in ProductImage table if present)
      for (const url of r.images) {
        await prisma.productImage.create({ data: { productId: product.id, url, alt: '' } })
      }
      created.push(product)
    }
    return NextResponse.json({ success: true, created })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || 'Failed' }, { status: 500 })
  }
}
