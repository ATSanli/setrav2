'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Check, CreditCard, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCart } from '@/hooks/use-cart'
import { formatPrice, cn } from '@/lib/utils'

const addressSchema = z.object({
  title: z.string().min(1, 'Adres başlığı gereklidir'),
  fullName: z.string().min(3, 'Ad Soyad gereklidir'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası giriniz'),
  address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
  city: z.string().min(2, 'Şehir gereklidir'),
  district: z.string().min(2, 'İlçe gereklidir'),
  postalCode: z.string().min(5, 'Posta kodu gereklidir'),
})

type AddressFormData = z.infer<typeof addressSchema>

interface Address {
  id: string
  title: string
  fullName: string
  phone: string
  address: string
  city: string
  district: string
  postalCode: string
  isDefault: boolean
}

interface CheckoutFormProps {
  addresses: Address[]
}

const FREE_SHIPPING_THRESHOLD = 500

export function CheckoutForm({ addresses: initialAddresses }: CheckoutFormProps) {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [addresses, setAddresses] = useState(initialAddresses)
  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find(a => a.isDefault)?.id || addresses[0]?.id || ''
  )
  const [orderNote, setOrderNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [isAddingAddress, setIsAddingAddress] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema)
  })

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 29.90
  const total = subtotal + shippingCost

  const onAddAddress = async (data: AddressFormData) => {
    setIsAddingAddress(true)
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) throw new Error('Failed to add address')

      const newAddress = await res.json()
      setAddresses(prev => [...prev, newAddress])
      setSelectedAddressId(newAddress.id)
      setShowAddressDialog(false)
      reset()
      toast.success('Adres eklendi')
    } catch {
      toast.error('Adres eklenemedi')
    } finally {
      setIsAddingAddress(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Lütfen teslimat adresi seçiniz')
      return
    }

    if (items.length === 0) {
      toast.error('Sepetiniz boş')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          note: orderNote
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Order failed')
      }

      const order = await res.json()
      await clearCart()
      router.push(`/siparis-onay/${order.orderNumber}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sipariş oluşturulamadı')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Sepetiniz boş. Ödeme yapabilmek için sepetinize ürün ekleyin.</p>
        <Button className="mt-4" onClick={() => router.push('/urunler')}>
          Alışverişe Devam Et
        </Button>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left column - Address & Payment */}
      <div className="lg:col-span-2 space-y-8">
        {/* Delivery Address */}
        <div className="bg-background p-6 rounded-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-serif text-xl">Teslimat Adresi</h2>
            </div>
            <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Adres
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Adres Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onAddAddress)} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title">Adres Başlığı</Label>
                    <Input
                      id="title"
                      placeholder="Ev, İş vb."
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="fullName">Ad Soyad</Label>
                    <Input id="fullName" {...register('fullName')} />
                    {errors.fullName && (
                      <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" placeholder="05XX XXX XX XX" {...register('phone')} />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="address">Adres</Label>
                    <Textarea id="address" {...register('address')} />
                    {errors.address && (
                      <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Şehir</Label>
                      <Input id="city" {...register('city')} />
                      {errors.city && (
                        <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="district">İlçe</Label>
                      <Input id="district" {...register('district')} />
                      {errors.district && (
                        <p className="text-sm text-destructive mt-1">{errors.district.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Posta Kodu</Label>
                    <Input id="postalCode" {...register('postalCode')} />
                    {errors.postalCode && (
                      <p className="text-sm text-destructive mt-1">{errors.postalCode.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isAddingAddress}>
                    {isAddingAddress ? 'Ekleniyor...' : 'Adresi Kaydet'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {addresses.length > 0 ? (
            <RadioGroup
              value={selectedAddressId}
              onValueChange={setSelectedAddressId}
              className="space-y-3"
            >
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={cn(
                    'flex items-start gap-3 p-4 border rounded-sm cursor-pointer transition-colors',
                    selectedAddressId === address.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value={address.id} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{address.title}</span>
                      {address.isDefault && (
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                          Varsayılan
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {address.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.district}, {address.city} {address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{address.phone}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Kayıtlı adresiniz yok. Yeni adres ekleyin.
            </p>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-background p-6 rounded-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-serif text-xl">Ödeme Yöntemi</h2>
          </div>

          <div className="border border-primary bg-primary/5 rounded-sm p-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Kapıda Ödeme</p>
                <p className="text-sm text-muted-foreground">
                  Siparişinizi teslim alırken nakit veya kredi kartı ile ödeyebilirsiniz
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            * Kredi kartı ile online ödeme yakında aktif olacaktır.
          </p>
        </div>

        {/* Order Note */}
        <div className="bg-background p-6 rounded-sm">
          <h2 className="font-serif text-xl mb-4">Sipariş Notu</h2>
          <Textarea
            placeholder="Siparişinizle ilgili eklemek istediğiniz notlar (opsiyonel)"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Right column - Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-background p-6 rounded-sm sticky top-24">
          <h2 className="font-serif text-xl mb-6">Sipariş Özeti</h2>

          {/* Items */}
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-16 h-20 bg-secondary flex-shrink-0 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.color} / {item.size}
                  </p>
                  <p className="text-sm mt-1">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totals */}
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

          <Button
            className="w-full h-12"
            size="lg"
            onClick={handlePlaceOrder}
            disabled={isSubmitting || !selectedAddressId}
          >
            {isSubmitting ? 'İşleniyor...' : 'Siparişi Tamamla'}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Siparişi tamamlayarak satış sözleşmesini kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  )
}
