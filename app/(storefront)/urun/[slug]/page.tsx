import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ProductDetail } from './product-detail'

interface Props {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' }
      },
      variants: {
        orderBy: [{ color: 'asc' }, { size: 'asc' }]
      },
      reviews: {
        where: { isApproved: true },
        include: {
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })
  return product
}

async function getRelatedProducts(categoryId: string, excludeId: string) {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      isActive: true,
      id: { not: excludeId }
    },
    include: {
      category: {
        select: { name: true, slug: true }
      },
      images: {
        take: 1,
        orderBy: { sortOrder: 'asc' }
      },
      variants: {
        select: { color: true, colorHex: true },
        distinct: ['color']
      }
    },
    take: 4
  })
  return products
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  
  if (!product) {
    return { title: 'Ürün Bulunamadı' }
  }

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images[0] ? [product.images[0].url] : undefined
    }
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id)

  // Calculate average rating
  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0

  // Get unique colors and sizes
  const colors = [...new Map(
    product.variants.map(v => [v.color, { color: v.color, colorHex: v.colorHex }])
  ).values()]
  
  const sizes = [...new Set(product.variants.map(v => v.size))]

  return (
    <ProductDetail
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        sku: product.sku,
        category: product.category,
        images: product.images,
        variants: product.variants.map(v => ({
          id: v.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stock: v.stock
        })),
        colors,
        sizes,
        isNew: product.isNew,
        avgRating,
        reviewCount: product.reviews.length,
        reviews: product.reviews.map(r => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          userName: `${r.user.firstName} ${r.user.lastName.charAt(0)}.`,
          createdAt: r.createdAt.toISOString()
        }))
      }}
      relatedProducts={relatedProducts.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        image: p.images[0]?.url || '/images/placeholder.jpg',
        category: p.category.name,
        colors: p.variants
      }))}
    />
  )
}
