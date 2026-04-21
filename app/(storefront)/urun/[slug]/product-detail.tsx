'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, Heart, Minus, Plus, Star, Truck, RotateCcw, Shield, Instagram } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from '@/components/product-card'
import { useCart } from '@/hooks/use-cart'
import { cn, formatPrice } from '@/lib/utils'
import { useT } from '@/components/providers/language-provider'

interface ProductDetailProps {
  product: {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    comparePrice: number | null
    sku: string
    category: { id: string; name: string; slug: string }
    images: { id: string; url: string; alt: string | null }[]
    variants: { id: string; size: string; color: string; colorHex: string | null; stock: number }[]
    colors: { color: string; colorHex: string | null }[]
    sizes: string[]
    isNew: boolean
    avgRating: number
    reviewCount: number
    reviews: {
      id: string
      rating: number
      title: string | null
      comment: string | null
      userName: string
      createdAt: string
    }[]
  }
  relatedProducts: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice: number | null
    image: string
    category: string
    colors: { color: string; colorHex: string | null }[]
  }[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.color || '')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const t = useT()

  // Get available sizes for selected color
  const availableSizes = product.variants
    .filter(v => v.color === selectedColor && v.stock > 0)
    .map(v => v.size)

  // Get selected variant
  const selectedVariant = product.variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  )

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error(t('select_size'))
      return
    }

    if (!selectedVariant) {
      toast.error(t('variant_not_found'))
      return
    }

    setIsAddingToCart(true)
    const result = await addItem(product.id, selectedVariant.id, quantity)
    setIsAddingToCart(false)

    if (result.success) {
      toast.success(t('product_added'))
    } else {
      toast.error(result.error || t('product_add_error'))
    }
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 py-4">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              {t('home')}
            </Link>
          </li>
          <ChevronRight className="h-4 w-4" />
          <li>
            <Link
              href={`/kategori/${product.category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category.name}
            </Link>
          </li>
          <ChevronRight className="h-4 w-4" />
          <li className="text-foreground font-medium truncate max-w-[200px]">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Product section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
              {product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]?.url || '/images/placeholder.jpg'}
                  alt={product.images[selectedImage]?.alt || product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
              {product.isNew && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-primary-foreground text-xs uppercase tracking-wider">
                  {t('new_badge')}
                </span>
              )}
              {discount && (
                <span className="absolute top-4 right-4 px-3 py-1.5 bg-accent text-accent-foreground text-sm font-medium">
                  %{discount}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative w-20 h-24 flex-shrink-0 border-2 transition-colors overflow-hidden',
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-border'
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {product.category.name}
              </p>
              <h1 className="font-serif text-3xl lg:text-4xl mb-4">{product.name}</h1>

              {/* Rating */}
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < Math.round(product.avgRating)
                            ? 'fill-accent text-accent'
                            : 'text-border'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount} değerlendirme)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-medium">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Color selection */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">
                  {t('color_label')}: <span className="text-muted-foreground">{selectedColor}</span>
                </p>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.color}
                      onClick={() => {
                        setSelectedColor(c.color)
                        setSelectedSize('')
                      }}
                      className={cn(
                        'w-10 h-10 rounded-full border-2 transition-all',
                        selectedColor === c.color
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary'
                      )}
                      style={{ backgroundColor: c.colorHex || '#ddd' }}
                      title={c.color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">{t('size_label')}</p>
                  <Link
                    href="/beden-rehberi"
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    {t('size_guide')}
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isAvailable = availableSizes.includes(size)
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={cn(
                          'min-w-[48px] h-12 px-4 border text-sm transition-colors',
                          selectedSize === size
                            ? 'border-primary bg-primary text-primary-foreground'
                            : isAvailable
                            ? 'border-border hover:border-primary'
                            : 'border-border/50 text-muted-foreground/50 cursor-not-allowed line-through'
                        )}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium mb-3">{t('quantity_label')}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 h-12 flex items-center justify-center border-x">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {selectedVariant && (
                  <span className="text-sm text-muted-foreground">
                    {t('stock_label')}: {selectedVariant.stock} {t('pieces')}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                size="lg"
                className="flex-1 h-14"
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedSize}
              >
                {isAddingToCart ? t('adding') : t('add_to_cart')}
              </Button>
              <Button size="lg" variant="outline" className="h-14 w-14">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{t('shipping')}</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{t('free_returns')}</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{t('secure_order')}</p>
              </div>
            </div>

            {/* SKU */}
            <p className="text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          </div>
        </div>
      </section>

      {/* Product details tabs */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-12">
          <Tabs defaultValue="description" className="max-w-3xl">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="description"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  {t('description_label')}
                </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                {`${t('reviews_label')} (${product.reviewCount})`}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-6">
              {product.description ? (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{product.description}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">{t('product_description_missing')}</p>
              )}
              {/* Instagram follow callout */}
              <section className="border-t bg-background">
                <div className="container mx-auto px-4 py-8">
                  <div className="flex items-center justify-center gap-4">
                    <Instagram className="h-6 w-6 text-muted-foreground" />
                    <a
                      href="https://instagram.com/setraofficialtr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t('instagram.follow_more')}
                    </a>
                  </div>
                </div>
              </section>
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              {product.reviews.length > 0 ? (
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-4 w-4',
                                i < review.rating
                                  ? 'fill-accent text-accent'
                                  : 'text-border'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      {review.title && (
                        <h4 className="font-medium mb-1">{review.title}</h4>
                      )}
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t('no_reviews_yet')}</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="border-t bg-secondary/30">
          <div className="container mx-auto px-4 py-16">
            <h2 className="font-serif text-2xl lg:text-3xl mb-8">{t('similar_products')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  comparePrice={product.comparePrice}
                  image={product.image}
                  category={product.category}
                  colors={product.colors}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
