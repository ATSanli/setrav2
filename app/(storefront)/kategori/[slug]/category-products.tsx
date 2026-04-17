'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ProductCard } from '@/components/product-card'
import { cn, formatPrice } from '@/lib/utils'

interface CategoryProductsProps {
  category: {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    children: { id: string; name: string; slug: string }[]
  }
  products: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice: number | null
    image: string
    category: string
    isNew: boolean
    colors: { color: string; colorHex: string | null }[]
  }[]
  pagination: {
    page: number
    total: number
    totalPages: number
  }
  filterOptions: {
    colors: { color: string; colorHex: string | null }[]
    sizes: string[]
    minPrice: number
    maxPrice: number
  }
  currentFilters: {
    sortBy: string
    colors: string[]
    sizes: string[]
    minPrice?: number
    maxPrice?: number
  }
}

export function CategoryProducts({
  category,
  products,
  pagination,
  filterOptions,
  currentFilters
}: CategoryProductsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const updateFilters = (key: string, value: string | string[] | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === undefined || (Array.isArray(value) && value.length === 0)) {
      params.delete(key)
    } else if (Array.isArray(value)) {
      params.delete(key)
      value.forEach(v => params.append(key, v))
    } else {
      params.set(key, value)
    }
    
    params.delete('page') // Reset to page 1 when filters change
    router.push(`?${params.toString()}`)
  }

  const toggleArrayFilter = (key: string, value: string, currentValues: string[]) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    updateFilters(key, newValues)
  }

  const clearFilters = () => {
    router.push(`/kategori/${category.slug}`)
  }

  const hasActiveFilters = currentFilters.colors.length > 0 || 
    currentFilters.sizes.length > 0 || 
    currentFilters.minPrice || 
    currentFilters.maxPrice

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Subcategories */}
      {category.children.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Alt Kategoriler</h3>
          <div className="space-y-2">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/kategori/${child.slug}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {filterOptions.colors.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
            <h3 className="font-medium">Renk</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="space-y-2">
              {filterOptions.colors.map((color) => (
                <label
                  key={color.color}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Checkbox
                    checked={currentFilters.colors.includes(color.color)}
                    onCheckedChange={() => 
                      toggleArrayFilter('colors', color.color, currentFilters.colors)
                    }
                  />
                  <span
                    className="w-5 h-5 rounded-full border"
                    style={{ backgroundColor: color.colorHex || '#ddd' }}
                  />
                  <span className="text-sm">{color.color}</span>
                </label>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Sizes */}
      {filterOptions.sizes.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
            <h3 className="font-medium">Beden</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="flex flex-wrap gap-2">
              {filterOptions.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleArrayFilter('sizes', size, currentFilters.sizes)}
                  className={cn(
                    'px-3 py-1.5 text-sm border transition-colors',
                    currentFilters.sizes.includes(size)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Price range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <h3 className="font-medium">Fiyat</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2">
            {[
              { label: '0 - 500 TL', min: 0, max: 500 },
              { label: '500 - 1000 TL', min: 500, max: 1000 },
              { label: '1000 - 2000 TL', min: 1000, max: 2000 },
              { label: '2000 TL +', min: 2000, max: undefined },
            ].map((range) => (
              <label
                key={range.label}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Checkbox
                  checked={
                    currentFilters.minPrice === range.min &&
                    currentFilters.maxPrice === range.max
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilters('minPrice', range.min.toString())
                      if (range.max) {
                        updateFilters('maxPrice', range.max.toString())
                      } else {
                        updateFilters('maxPrice', undefined)
                      }
                    } else {
                      updateFilters('minPrice', undefined)
                      updateFilters('maxPrice', undefined)
                    }
                  }}
                />
                <span className="text-sm">{range.label}</span>
              </label>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
        >
          Filtreleri Temizle
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-48 lg:h-64 bg-secondary overflow-hidden">
        {category.image && (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <nav className="mb-4">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Ana Sayfa
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <li className="font-medium">{category.name}</li>
            </ol>
          </nav>
          <h1 className="font-serif text-3xl lg:text-4xl">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{category.description}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex lg:gap-8">
          {/* Desktop filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="font-medium text-lg mb-6">Filtreler</h2>
              <FilterContent />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <p className="text-sm text-muted-foreground">
                {pagination.total} ürün bulundu
              </p>

              <div className="flex items-center gap-4">
                {/* Mobile filter button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filtrele
                      {hasActiveFilters && (
                        <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {currentFilters.colors.length + currentFilters.sizes.length + (currentFilters.minPrice ? 1 : 0)}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filtreler</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select
                  value={currentFilters.sortBy}
                  onValueChange={(value) => updateFilters('sort', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sıralama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">En Yeni</SelectItem>
                    <SelectItem value="popular">Popüler</SelectItem>
                    <SelectItem value="price-asc">Fiyat: Düşükten Yükseğe</SelectItem>
                    <SelectItem value="price-desc">Fiyat: Yüksekten Düşüğe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {currentFilters.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleArrayFilter('colors', color, currentFilters.colors)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-secondary text-sm rounded-full"
                  >
                    {color}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {currentFilters.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleArrayFilter('sizes', size, currentFilters.sizes)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-secondary text-sm rounded-full"
                  >
                    {size}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {currentFilters.minPrice && (
                  <button
                    onClick={() => {
                      updateFilters('minPrice', undefined)
                      updateFilters('maxPrice', undefined)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-secondary text-sm rounded-full"
                  >
                    {formatPrice(currentFilters.minPrice)} - {currentFilters.maxPrice ? formatPrice(currentFilters.maxPrice) : '∞'}
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {/* Product grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    comparePrice={product.comparePrice}
                    image={product.image}
                    category={product.category}
                    isNew={product.isNew}
                    colors={product.colors}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">
                  Bu kriterlere uygun ürün bulunamadı.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Filtreleri Temizle
                </Button>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Link
                    key={page}
                    href={`?${new URLSearchParams({
                      ...Object.fromEntries(searchParams.entries()),
                      page: page.toString()
                    }).toString()}`}
                    className={cn(
                      'w-10 h-10 flex items-center justify-center border transition-colors',
                      pagination.page === page
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary'
                    )}
                  >
                    {page}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
