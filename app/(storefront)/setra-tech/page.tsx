import type { Metadata } from 'next'

import SetraTechClient from '@/components/setra-tech/setra-tech-client'
import { projects } from '@/components/setra-tech/content'

export const metadata: Metadata = {
  metadataBase: new URL('https://setraofficial.com'),
  title: 'SETRA TECH | Yazılım, Yapay Zekâ ve Otomasyon Stüdyosu',
  description:
    'SETRA TECH; CompOS ve diğer projeleriyle özel yazılım, yapay zekâ, otomasyon ve entegrasyon çözümleri geliştirir. Hizmetleri inceleyin, teklif alın.',
  alternates: { canonical: 'https://setraofficial.com/setra-tech' },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://setraofficial.com/setra-tech',
    siteName: 'SETRA',
    title: 'SETRA TECH | Yazılım, Yapay Zekâ ve Otomasyon Stüdyosu',
    description: 'CompOS ve SETRA TECH referansları. Özel yazılım, e-ticaret, yapay zekâ ve otomasyon çözümleri.',
  },
  twitter: {
    card: 'summary',
    title: 'SETRA TECH | Yazılım, Yapay Zekâ ve Otomasyon Stüdyosu',
    description: 'CompOS ve SETRA TECH projelerini keşfedin.',
  },
}

export default function SetraTechPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'SETRA TECH projeleri ve hizmetleri',
    url: 'https://setraofficial.com/setra-tech',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: projects.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: project.name,
          description: project.solution,
        },
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <SetraTechClient />
    </>
  )
}
