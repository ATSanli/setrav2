'use client'

import useSWR from 'swr'
import { CartItemDisplay } from '@/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface CartData {
  items: CartItemDisplay[]
  subtotal: number
  itemCount: number
}

export function useCart() {
  const { data, error, isLoading, mutate } = useSWR<CartData>(
    '/api/cart',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000
    }
  )

  const addItem = async (productId: string, variantId: string, quantity: number = 1) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, quantity })
      })
      
      if (!res.ok) throw new Error('Failed to add item')
      
      mutate()
      return { success: true }
    } catch {
      return { success: false, error: 'Ürün sepete eklenemedi' }
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      })
      
      if (!res.ok) throw new Error('Failed to update quantity')
      
      mutate()
      return { success: true }
    } catch {
      return { success: false, error: 'Miktar güncellenemedi' }
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error('Failed to remove item')
      
      mutate()
      return { success: true }
    } catch {
      return { success: false, error: 'Ürün silinemedi' }
    }
  }

  const clearCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error('Failed to clear cart')
      
      mutate()
      return { success: true }
    } catch {
      return { success: false, error: 'Sepet temizlenemedi' }
    }
  }

  return {
    items: data?.items || [],
    subtotal: data?.subtotal || 0,
    itemCount: data?.itemCount || 0,
    isLoading,
    error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    mutate
  }
}
