'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'

const FREE_SHIPPING_THRESHOLD = 500

export function CartContent() {
  const router = useRouter()
  const { items, subtotal, isLoading, updateQuantity, removeItem, clearCart } = useCart()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(itemId))
    const result = await updateQuantity(itemId, newQuantity)
    setUpdatingItems(prev => {
      const next = new Set(prev)
      next.delete(itemId)
      return next
    })
    
    if (!result.success) {
      toast.error(result.error)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    const result = await removeItem(itemId)
    if (result.success) {
      toast.success('Ürün sepetten kaldırıldı')
    } else {
      toast.error(result.error)
    }
  }

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 29.90
  const total = subtotal + shippingCost
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-medium mb-2">Sepetiniz boş</h2>
        <p className="text-muted-foreground mb-6">
          Alışverişe başlamak için ürünlerimize göz atın.
        </p>
        <Button asChild>
          <Link href="/urunler">
            Alışverişe Başla
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart items */}
      <div className="lg:col-span-2 space-y-4">
        {/* Free shipping progress */}
        {remainingForFreeShipping > 0 && (
          <div className="bg-accent/10 border border-accent/20 rounded-sm p-4">
            <p className="text-sm text-center">
              <span className="font-medium">{formatPrice(remainingForFreeShipping)}</span> daha ekleyin, 
              <span className="font-medium text-accent"> ücretsiz kargo</span> kazanın!
            </p>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all"
                style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="divide-y">
          {items.map((item) => (
            <div key={item.id} className="py-6 first:pt-0 last:pb-0">
              <div className="flex gap-4">
                {/* Image */}
                <Link href={`/urun/${item.productId}`} className="flex-shrink-0">
                  <div className="relative w-24 h-32 bg-secondary overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div>
                      <Link 
                        href={`/urun/${item.productId}`}
                        className="font-medium hover:text-accent transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.color} / {item.size}
                      </p>
                    </div>
                    <p className="font-medium whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity */}
                    <div className="flex items-center border">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={updatingItems.has(item.id) || item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-10 h-8 flex items-center justify-center text-sm border-x">
                        {updatingItems.has(item.id) ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updatingItems.has(item.id) || item.quantity >= item.stock}
                        className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {item.stock <= 3 && (
                    <p className="text-xs text-accent mt-2">
                      Son {item.stock} adet!
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <div className="bg-secondary/30 p-6 sticky top-24">
          <h2 className="font-serif text-xl mb-6">Sipariş Özeti</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ara Toplam</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kargo</span>
              <span className={shippingCost === 0 ? 'text-accent' : ''}>
                {shippingCost === 0 ? 'Ücretsiz' : formatPrice(shippingCost)}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between font-medium text-lg mb-6">
            <span>Toplam</span>
            <span>{formatPrice(total)}</span>
          </div>

          <Button className="w-full h-12" size="lg" asChild>
            <Link href="/odeme">
              Ödemeye Geç
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Siparişiniz güvenli ödeme ile işlenir
          </p>

          <Separator className="my-6" />

          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-current" />
              14 gün ücretsiz iade
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-current" />
              Güvenli SSL ödeme
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-current" />
              Hızlı teslimat
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
