'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'
import { useT } from '@/components/providers/language-provider'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  image: string
  category?: string
  isNew?: boolean
  isFeatured?: boolean
  colors?: { color: string; colorHex: string | null }[]
  isFavorited?: boolean
  initialFavoriteId?: string | null
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  comparePrice,
  image,
  category,
  isNew,
  colors,
  isFavorited,
  initialFavoriteId
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(Boolean(isFavorited))
  const [favoriteId, setFavoriteId] = useState<string | null>(initialFavoriteId ?? null)
  const [imageError, setImageError] = useState(false)
  const t = useT()

  const discount = comparePrice 
    ? Math.round(((comparePrice - price) / comparePrice) * 100) 
    : null

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // optimistic UI
    if (!isWishlisted) {
      setIsWishlisted(true)
      try {
        const res = await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id }) })
        if (res.status === 401) return window.location.href = '/giris'
        const js = await res.json()
        if (!res.ok) throw new Error(js?.error || 'Failed')
        setFavoriteId(js?.id ?? null)
        toast.success(t('favorites.added'))
      } catch (err: any) {
        setIsWishlisted(false)
        toast.error(err?.message || t('add_failed'))
      }
    } else {
      // remove
      setIsWishlisted(false)
      try {
        let fid = favoriteId
        if (!fid) {
          // fallback: find favorite id
          const r = await fetch('/api/favorites')
          if (r.status === 401) return window.location.href = '/giris'
          const js = await r.json()
          const found = (js.items || []).find((it: any) => it.productId === id)
          fid = found?.id
        }
        if (!fid) {
          // nothing to delete
          toast.success(t('favorites.removed'))
          return
        }
        const d = await fetch(`/api/favorites/${fid}`, { method: 'DELETE' })
        if (d.status === 401) return window.location.href = '/giris'
        const jd = await d.json()
        if (!d.ok) throw new Error(jd?.error || 'Failed')
        setFavoriteId(null)
        toast.success(t('favorites.removed'))
      } catch (err: any) {
        setIsWishlisted(true)
        toast.error(err?.message || t('remove_failed'))
      }
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const variantId = (colors && (colors as any)[0] && (colors as any)[0].id) || null
    if (!variantId) {
      toast.error(t('select_variant_message'))
      return
    }
    try {
      const res = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id, variantId, quantity: 1 }) })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.error || t('add_failed'))
      toast.success(t('added_to_cart'))
    } catch (err: any) {
      toast.error(err?.message || t('add_failed'))
    }
  }

  return (
    <article className="group relative">
      <Link href={`/urun/${slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
          <Image
            src={imageError ? '/images/placeholder.jpg' : image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageError(true)}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs uppercase tracking-wider">
                {t('new_badge')}
              </span>
            )}
            {discount && (
              <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-medium">
                %{discount}
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-3 right-3 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity",
              isWishlisted && "opacity-100"
            )}
            onClick={handleWishlist}
          >
            <Heart 
              className={cn(
                "h-5 w-5",
                isWishlisted && "fill-accent text-accent"
              )} 
            />
          </Button>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <Button 
              variant="secondary" 
              className="flex-1 bg-background/95 hover:bg-background"
              onClick={(e) => {
                e.preventDefault()
                // Navigate to product page for size selection
                window.location.href = `/urun/${slug}`
              }}
            >
              {t('quick_view')}
            </Button>
            <Button variant="ghost" className="bg-background/95 hover:bg-background" onClick={handleAddToCart}>{t('add_to_cart')}</Button>
          </div>
        </div>

        {/* Product info */}
        <div className="space-y-2">
          {category && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {category}
            </p>
          )}
          <h3 className="font-medium text-sm lg:text-base line-clamp-2 group-hover:text-accent transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-medium">{formatPrice(price)}</span>
            {comparePrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>

          {/* Color swatches */}
          {colors && colors.length > 1 && (
            <div className="flex items-center gap-1.5 pt-1">
              {colors.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: c.colorHex || '#ddd' }}
                  title={c.color}
                />
              ))}
              {colors.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}
