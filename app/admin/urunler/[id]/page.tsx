"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProductForm from '@/components/admin/product-form'

export default function EditProductPageClient() {
  const params = useParams()
  const id = params?.id as string | undefined
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
   const [categories, setCategories] = useState<Array<any> | null>(null)

  // fallback: try to parse id from pathname if useParams is empty
  useEffect(() => {
    let resolvedId = id
    if (!resolvedId && typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean)
      const last = parts[parts.length - 1]
      resolvedId = last
    }

    if (!resolvedId) {
      setError('Missing product id')
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/products/${resolvedId}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data?.error || 'Failed to fetch product')
          return
        }
        const data = await res.json()
        setProduct(data.product)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product')
      } finally {
        setLoading(false)
      }
    }

    const fetchCategories = async () => {
      try {
        const r = await fetch('/api/admin/categories')
        if (!r.ok) return
        const j = await r.json()
        setCategories(j.categories || [])
      } catch (e) { }
    }

    fetchProduct()
    fetchCategories()
  }, [id])
  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!product) return <div>Product not found</div>

  const initialData = {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null
  }

  return (
    <div>
      <ProductForm initialData={initialData} productId={product.id} categories={categories || []} />
    </div>
  )
}
