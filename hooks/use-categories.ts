'use client'

import useSWR from 'swr'

export type StoreCategory = { name: string; slug: string; image: string | null }

const fetcher = async (url: string): Promise<{ categories: StoreCategory[] }> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Kategoriler yüklenemedi')
  return response.json()
}

export function useCategories() {
  return useSWR('/api/categories', fetcher)
}
