'use client'

import useSWR from 'swr'
import { useT } from '@/components/providers/language-provider'
import { CartItemDisplay } from '@/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface CartData {
  items: CartItemDisplay[]
  subtotal: number
  itemCount: number
  couponCode?: string | null
  discount?: number
}

export function useCart() {
  const t = useT()
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
      return { success: false, error: t('cart_add_failed') }
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
      return { success: false, error: t('cart_update_failed') }
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
      return { success: false, error: t('cart_remove_failed') }
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
      return { success: false, error: t('cart_clear_failed') }
    }
  }

  return {
    items: data?.items || [],
    subtotal: data?.subtotal || 0,
    couponCode: data?.couponCode || null,
    discount: data?.discount || 0,
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
