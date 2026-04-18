"use client"

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useT } from '@/components/providers/language-provider'

export default function NewArrivalsEmpty() {
  const t = useT()

  return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">{t('no_new_products') ?? 'Henüz yeni ürün eklenmedi.'}</p>
      <div className="mt-6">
        <Link href="/urunler" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-sm">
          {t('start_shopping')} <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
