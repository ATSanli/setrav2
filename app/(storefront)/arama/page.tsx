import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/product-card'
import { translations } from '@/translations'

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const search = await searchParams
  const query = search.q as string || ''
  
  return {
    title: query ? `"${query}" için arama sonuçları` : 'Arama',
    description: `SETRA mağazasında "${query}" araması`
  }
}

async function searchProducts(query: string, page: number = 1, limit: number = 12) {
  if (!query.trim()) {
    return { products: [], total: 0, totalPages: 0 }
  }

  const skip = (page - 1) * limit
  const searchTerm = `%${query}%`

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { name: { contains: query } } }
        ]
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
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { name: { contains: query } } }
        ]
      }
    })
  ])

  return { products, total, totalPages: Math.ceil(total / limit) }
}

export default async function SearchPage({ searchParams }: Props) {
  const search = await searchParams
  const query = (search.q as string) || ''
  const page = Number(search.page) || 1
  
  const { products, total, totalPages } = await searchProducts(query, page)

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
              <li className="font-medium">{translations.tr.search_title || 'Arama'}</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3">
            <Search className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="font-serif text-3xl lg:text-4xl">
                {query ? `"${query}"` : translations.tr.search_title}
              </h1>
              <p className="text-muted-foreground mt-1">
                {total > 0 ? `${total} ${translations.tr.results_found}` : translations.tr.no_results}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
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
                isNew={product.isNew}
                colors={product.variants}
              />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-medium mb-2">{translations.tr.no_results}</h2>
            <p className="text-muted-foreground mb-6">
              &quot;{query}&quot; için herhangi bir ürün bulunamadı.
            </p>
            <p className="text-sm text-muted-foreground">
              {translations.tr.try_other_keywords}
            </p>
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-medium mb-2">{translations.tr.search_prompt}</h2>
            <p className="text-muted-foreground">
              {translations.tr.use_search_box}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/arama?q=${encodeURIComponent(query)}&page=${p}`}
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
