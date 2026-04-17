import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { CategoryProducts } from './category-products'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })
  return category
}

async function getCategoryProducts(
  categoryId: string,
  page: number = 1,
  limit: number = 12,
  sortBy: string = 'newest',
  filters: {
    minPrice?: number
    maxPrice?: number
    colors?: string[]
    sizes?: string[]
  } = {}
) {
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {
    categoryId,
    isActive: true
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {}
    if (filters.minPrice) (where.price as Record<string, number>).gte = filters.minPrice
    if (filters.maxPrice) (where.price as Record<string, number>).lte = filters.maxPrice
  }

  if (filters.colors?.length || filters.sizes?.length) {
    where.variants = {
      some: {
        ...(filters.colors?.length && { color: { in: filters.colors } }),
        ...(filters.sizes?.length && { size: { in: filters.sizes } }),
        stock: { gt: 0 }
      }
    }
  }

  const orderBy: Record<string, string> = {}
  switch (sortBy) {
    case 'price-asc':
      orderBy.price = 'asc'
      break
    case 'price-desc':
      orderBy.price = 'desc'
      break
    case 'popular':
      orderBy.isFeatured = 'desc'
      break
    default:
      orderBy.createdAt = 'desc'
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
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
      orderBy,
      skip,
      take: limit
    }),
    prisma.product.count({ where })
  ])

  return { products, total, totalPages: Math.ceil(total / limit) }
}

async function getFilterOptions(categoryId: string) {
  const variants = await prisma.productVariant.findMany({
    where: {
      product: {
        categoryId,
        isActive: true
      },
      stock: { gt: 0 }
    },
    select: {
      color: true,
      colorHex: true,
      size: true
    },
    distinct: ['color', 'size']
  })

  const colors = [...new Map(variants.map(v => [v.color, { color: v.color, colorHex: v.colorHex }])).values()]
  const sizes = [...new Set(variants.map(v => v.size))]

  const priceRange = await prisma.product.aggregate({
    where: { categoryId, isActive: true },
    _min: { price: true },
    _max: { price: true }
  })

  return {
    colors,
    sizes,
    minPrice: Number(priceRange._min.price) || 0,
    maxPrice: Number(priceRange._max.price) || 10000
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return { title: 'Kategori Bulunamadı' }
  }

  return {
    title: category.name,
    description: category.description || `${category.name} kategorisindeki tüm ürünlerimizi keşfedin.`
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const search = await searchParams
  
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const page = Number(search.page) || 1
  const sortBy = (search.sort as string) || 'newest'
  const colors = search.colors ? (Array.isArray(search.colors) ? search.colors : [search.colors]) : []
  const sizes = search.sizes ? (Array.isArray(search.sizes) ? search.sizes : [search.sizes]) : []
  const minPrice = search.minPrice ? Number(search.minPrice) : undefined
  const maxPrice = search.maxPrice ? Number(search.maxPrice) : undefined

  const [{ products, total, totalPages }, filterOptions] = await Promise.all([
    getCategoryProducts(category.id, page, 12, sortBy, { minPrice, maxPrice, colors, sizes }),
    getFilterOptions(category.id)
  ])

  return (
    <CategoryProducts
      category={{
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        children: category.children
      }}
      products={products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        image: p.images[0]?.url || '/images/placeholder.jpg',
        category: p.category.name,
        isNew: p.isNew,
        colors: p.variants
      }))}
      pagination={{ page, total, totalPages }}
      filterOptions={filterOptions}
      currentFilters={{ sortBy, colors, sizes, minPrice, maxPrice }}
    />
  )
}
