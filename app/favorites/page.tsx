'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useT } from '@/components/providers/language-provider'

export default function FavoritesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const t = useT()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session === undefined) return
    if (!session) {
      router.push('/giris')
      return
    }
    fetchFavorites()
  }, [session])

  async function fetchFavorites() {
    setLoading(true)
    try {
      const res = await fetch('/api/favorites')
      if (res.status === 401) return router.push('/giris')
      const js = await res.json()
      setItems(js.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(id: string) {
    const prev = items
    setItems(items.filter(i => i.id !== id))
    try {
      const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' })
      if (res.status === 401) return router.push('/giris')
      if (!res.ok) {
        const js = await res.json()
        throw new Error(js?.error || 'Failed')
      }
      toast.success(t('favorites.removed'))
    } catch (err: any) {
      setItems(prev)
      toast.error(err?.message || 'Failed')
    }
  }

  if (loading) return <p className="p-8">{t('loading')}</p>

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">{t('favorites.title')}</h1>

      {items.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">{t('favorites.empty')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="border rounded-md p-4 flex items-center gap-4">
              <Link href={`/urun/${item.productId}`} className="flex items-center gap-4">
                <div className="w-24 h-24 relative">
                  <Image src={item.image || '/images/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                </div>
              </Link>
              <div className="flex-1">
                <Link href={`/urun/${item.productId}`} className="block font-medium mb-1">{item.name}</Link>
                <div className="text-sm text-muted-foreground">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'TRY' }).format(item.price)}</div>
              </div>
              <div>
                <button onClick={() => handleRemove(item.id)} className="btn btn-ghost text-sm text-red-600">{t('favorites.remove')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
