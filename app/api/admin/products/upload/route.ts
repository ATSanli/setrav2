import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminOrSuper } from '@/lib/permissions'
import cloudinary from '@/lib/cloudinary'

export const runtime = 'nodejs'

async function uploadToCloudinary(url: string) {
  // URL varsa direkt Cloudinary’ye transfer et
  const result = await cloudinary.uploader.upload(url, {
    folder: 'setra/products',
  })

  return result.secure_url
}

async function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean)

  return lines.map((l) => {
    const parts = l.split(',')

    return {
      name: parts[0] || '',
      description: parts[1] || '',
      price: parseFloat(parts[2] || '0') || 0,
      category: parts[3] || '',
      stock: parseInt(parts[4] || '0') || 0,
      images: parts.slice(5).filter(Boolean),
    }
  })
}

export async function POST(request: Request) {
  try {
    await requireAdminOrSuper()

    const text = await request.text()
    const rows = await parseCSV(text)

    const created = []

    for (const r of rows) {
      // kategori
      const category = await prisma.category.upsert({
        where: { slug: r.category },
        update: {},
        create: { name: r.category, slug: r.category },
      })

      // ürün
      const product = await prisma.product.create({
        data: {
          name: r.name,
          slug: r.name.toLowerCase().replace(/\s+/g, '-'),
          description: r.description,
          price: r.price,
          sku: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          categoryId: category.id,
          stock: r.stock,
        },
      })

      // 🔥 IMAGE FIX (Cloudinary)
      for (const img of r.images) {
        let finalUrl = img

        // eğer local path gelirse Cloudinary’ye upload et
        if (!img.startsWith('http')) {
          finalUrl = await uploadToCloudinary(img)
        }

        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: finalUrl,
            alt: '',
          },
        })
      }

      created.push(product)
    }

    return NextResponse.json({ success: true, created })
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed' },
      { status: 500 }
    )
  }
}