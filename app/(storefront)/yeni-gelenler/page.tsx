import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/product-card'

export const metadata: Metadata = {
  title: 'Yeni Gelenler',
  description: 'SETRA koleksiyonuna yeni eklenen ürünleri keşfedin.'
}

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getNewProducts(page: number = 1, limit: number = 12) {
  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        isNew: true
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.product.count({
      where: { isActive: true, isNew: true }
    })
  ])

  return { products, total, totalPages: Math.ceil(total / limit) }
}

export default async function NewArrivalsPage({ searchParams }: Props) {
  const search = await searchParams
  const page = Number(search.page) || 1
  const { products, total, totalPages } = await getNewProducts(page)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-accent/10 py-12">
        <div className="container mx-auto px-4">
          <nav className="mb-4">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Ana Sayfa
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <li className="font-medium">Yeni Gelenler</li>
            </ol>
          </nav>
          <span className="text-sm uppercase tracking-widest text-accent font-medium mb-2 block">
            Yeni Koleksiyon
          </span>
          <h1 className="font-serif text-3xl lg:text-4xl">Yeni Gelenler</h1>
          <p className="text-muted-foreground mt-2">
            En yeni ürünlerimizi keşfedin - {total} yeni ürün
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Products */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={Number(product.price)}
                comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
                image={product.images[0]?.url || '/images/placeholder.jpg'}
                category={product.category.name}
                isNew={true}
                colors={product.variants}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Henüz yeni ürün eklenmedi.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/yeni-gelenler?page=${p}`}
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
