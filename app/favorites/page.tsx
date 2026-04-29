'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useT } from '@/components/providers/language-provider'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  async function fetchFavorites() {
    setLoading(true)
    try {
      const res = await fetch('/api/favorites')
      if (res.status === 401) return router.push('/giris')
      const js = await res.json()
      setItems(js.items || [])
    } catch (err) {
      console.error('fetchFavorites error:', err)
      toast({ title: t('error'), description: String(err) })
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
      toast({ title: t('favorites.removed') })
    } catch (err: any) {
      setItems(prev)
      console.error('handleRemove error:', err)
      toast({ title: t('error'), description: err?.message || 'Failed' })
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
                <div className="w-28 h-28 relative flex-shrink-0">
                  <Image src={item.image || '/images/placeholder.jpg'} alt={item.name} fill className="object-cover rounded" />
                </div>
              </Link>
              <div className="flex-1">
                <Link href={`/urun/${item.productId}`} className="block font-medium mb-1 hover:text-accent">{item.name}</Link>
                <div className="text-sm text-muted-foreground">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.price)}</div>
              </div>
              <div>
                <Button variant="ghost" onClick={() => handleRemove(item.id)} className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" /> {t('favorites.remove')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
