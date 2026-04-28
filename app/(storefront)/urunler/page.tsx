import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProductCard } from '@/components/product-card'
import { translations } from '@/translations'
import { ProductsFilter } from './products-filter'

export const metadata: Metadata = {
  title: 'Tüm Ürünler',
  description: 'SETRA koleksiyonundaki tüm ürünleri keşfedin.'
}

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getProducts(
  page: number = 1,
  limit: number = 12,
  sortBy: string = 'newest',
  categorySlug?: string
) {
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { isActive: true }
  
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug }
    })
    if (category) {
      where.categoryId = category.id
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

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' }
  })
}

export default async function ProductsPage({ searchParams }: Props) {
  const search = await searchParams
  const page = Number(search.page) || 1
  const sortBy = (search.sort as string) || 'newest'
  const categorySlug = search.category as string | undefined

  const [{ products, total, totalPages }, categories] = await Promise.all([
    getProducts(page, 12, sortBy, categorySlug),
    getCategories()
  ])

  // attach favorite flags for logged-in user
  const session = await getServerSession(authOptions)
  if (session) {
    const ids = products.map((p: any) => p.id)
    const favs = await prisma.favorite.findMany({ where: { userId: session.user.id, productId: { in: ids } } })
    const favMap = new Map(favs.map(f => [f.productId, f.id]))
    products.forEach((p: any) => {
      ;(p as any).isFavorited = Boolean(favMap.get(p.id))
      ;(p as any).favoriteId = favMap.get(p.id) ?? null
    })
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <nav className="mb-4">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  {translations.tr.home}
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <li className="font-medium">{translations.tr.all_products}</li>
            </ol>
          </nav>
          <h1 className="font-serif text-3xl lg:text-4xl">{translations.tr.all_products}</h1>
          <p className="text-muted-foreground mt-2">
            {total} {translations.tr.products_listed}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <ProductsFilter
          categories={categories.map(c => ({ name: c.name, slug: c.slug }))}
          currentCategory={categorySlug}
          currentSort={sortBy}
        />

        {/* Products */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={Number(product.price)}
                comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
                image={product.images[0]?.url || '/images/placeholder.jpg'}
                category={product.category.name}
                isNew={product.isNew}
                colors={product.variants}
                isFavorited={product.isFavorited}
                initialFavoriteId={product.favoriteId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Ürün bulunamadı.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/urunler?${new URLSearchParams({
                  ...(categorySlug && { category: categorySlug }),
                  sort: sortBy,
                  page: p.toString()
                }).toString()}`}
                className={`w-10 h-10 flex items-center justify-center border transition-colors ${
                  page === p
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
