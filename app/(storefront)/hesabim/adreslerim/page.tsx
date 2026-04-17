'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, MapPin, Trash2, Edit2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const addressSchema = z.object({
  title: z.string().min(1, 'Adres başlığı gereklidir'),
  fullName: z.string().min(3, 'Ad Soyad gereklidir'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası giriniz'),
  address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
  city: z.string().min(2, 'Şehir gereklidir'),
  district: z.string().min(2, 'İlçe gereklidir'),
  postalCode: z.string().min(5, 'Posta kodu gereklidir')
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

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema)
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  useEffect(() => {
    if (editingAddress) {
      reset(editingAddress)
    } else {
      reset({
        title: '',
        fullName: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        postalCode: ''
      })
    }
  }, [editingAddress, reset])

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses')
      const data = await res.json()
      setAddresses(data)
    } catch {
      toast.error('Adresler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true)
    try {
      const url = editingAddress
        ? `/api/addresses/${editingAddress.id}`
        : '/api/addresses'
      const method = editingAddress ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) throw new Error()

      toast.success(editingAddress ? 'Adres güncellendi' : 'Adres eklendi')
      setShowDialog(false)
      setEditingAddress(null)
      fetchAddresses()
    } catch {
      toast.error('İşlem başarısız')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Adres silindi')
      fetchAddresses()
    } catch {
      toast.error('Adres silinemedi')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true })
      })
      if (!res.ok) throw new Error()
      toast.success('Varsayılan adres güncellendi')
      fetchAddresses()
    } catch {
      toast.error('İşlem başarısız')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl">Adreslerim</h2>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open)
          if (!open) setEditingAddress(null)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Adres
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Adres Başlığı</Label>
                <Input id="title" placeholder="Ev, İş vb." {...register('title')} />
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`relative p-4 border rounded-sm ${
                address.isDefault ? 'border-primary' : ''
              }`}
            >
              {address.isDefault && (
                <span className="absolute top-2 right-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                  Varsayılan
                </span>
              )}
              <div className="pr-16">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {address.title}
                </h3>
                <div className="mt-2 text-sm text-muted-foreground space-y-1">
                  <p>{address.fullName}</p>
                  <p>{address.address}</p>
                  <p>{address.district}, {address.city} {address.postalCode}</p>
                  <p>{address.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Varsayılan Yap
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingAddress(address)
                    setShowDialog(true)
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(address.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-2">Kayıtlı adresiniz yok</h3>
          <p className="text-sm text-muted-foreground">
            Teslimat için yeni bir adres ekleyin.
          </p>
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adresi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu adresi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
