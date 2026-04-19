import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { translations } from '@/translations'
import ActionMenu from '@/components/admin/action-menu'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
        variants: { select: { stock: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return products
  } catch {
    return []
  }
}

async function ProductsTable() {
  const products = await getProducts()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{translations.tr.all_products} ({products.length})</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={translations.tr.admin_search_placeholder}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{translations.tr.image_label}</TableHead>
                <TableHead>{translations.tr.product_label}</TableHead>
                <TableHead>{translations.tr.category_label}</TableHead>
                <TableHead>{translations.tr.price_label}</TableHead>
                <TableHead>{translations.tr.stock_label}</TableHead>
                <TableHead>{translations.tr.status_label}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative h-12 w-12 bg-muted rounded overflow-hidden">
                        {product.images[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                            {translations.tr.no_image}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell>{product.category?.name || '-'}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatPrice(Number(product.price))}</p>
                        {product.comparePrice && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(Number(product.comparePrice))}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={totalStock <= 5 ? 'text-destructive font-medium' : ''}>
                        {totalStock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.isActive ? (
                          <Badge variant="secondary">{translations.tr.active_label}</Badge>
                        ) : (
                          <Badge variant="outline">{translations.tr.draft_label}</Badge>
                        )}
                        {product.isFeatured && (
                          <Badge className="bg-accent text-accent-foreground">{translations.tr.featured_label}</Badge>
                        )}
                        {product.isBestSeller && (
                          <Badge className="bg-yellow-100 text-yellow-800">{translations.tr.best_seller_label}</Badge>
                        )}
                        {product.isNew && (
                          <Badge className="bg-green-100 text-green-800">{translations.tr.new_badge}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ActionMenu id={product.id} slug={product.slug} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{translations.tr.no_products_found}</p>
            <Button asChild>
              <Link href="/admin/urunler/yeni">
                <Plus className="mr-2 h-4 w-4" />
                {translations.tr.add_first_product}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif">{translations.tr.products}</h1>
          <p className="text-muted-foreground">{translations.tr.manage_product_catalog}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/urunler/import">
              <Upload className="mr-2 h-4 w-4" />
              {translations.tr.import_products}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/urunler/yeni">
              <Plus className="mr-2 h-4 w-4" />
              {translations.tr.add_product}
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<ProductsTableSkeleton />}>
        <ProductsTable />
      </Suspense>
    </div>
  )
}

function ProductsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 w-12 bg-muted animate-pulse rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
