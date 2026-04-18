"use client"

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useT } from '@/components/providers/language-provider'

export default function NewArrivalsHeader({ total }: { total: number }) {
  const t = useT()

  return (
    <>
      <div className="bg-accent/10 py-12">
        <div className="container mx-auto px-4">
          <nav className="mb-4">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  {t('home') || 'Ana Sayfa'}
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <li className="font-medium">{t('new_arrivals')}</li>
            </ol>
          </nav>
          <span className="text-sm uppercase tracking-widest text-accent font-medium mb-2 block">
            {t('new_collection')}
          </span>
          <h1 className="font-serif text-3xl lg:text-4xl">{t('new_arrivals')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('hero_subtitle')} - {total} {t('new')}
          </p>
        </div>
      </div>
    </>
  )
}
