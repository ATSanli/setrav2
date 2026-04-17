'use client'

import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProductsFilterProps {
  categories: { name: string; slug: string }[]
  currentCategory?: string
  currentSort: string
}

export function ProductsFilter({ categories, currentCategory, currentSort }: ProductsFilterProps) {
  const router = useRouter()

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams()
    
    if (key === 'category') {
      if (value && value !== 'all') params.set('category', value)
      if (currentSort !== 'newest') params.set('sort', currentSort)
    } else if (key === 'sort') {
      if (currentCategory) params.set('category', currentCategory)
      if (value !== 'newest') params.set('sort', value)
    }

    router.push(`/urunler${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
      <Select
        value={currentCategory || 'all'}
        onValueChange={(value) => updateParams('category', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Kategoriler</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.slug} value={cat.slug}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentSort}
        onValueChange={(value) => updateParams('sort', value)}
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
  )
}
