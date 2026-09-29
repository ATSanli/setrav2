import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPage } from '@/components/content/info-page'

export const metadata: Metadata = { title: 'Hakkımızda', alternates: { canonical: '/hakkimizda' } }

export default function AboutPage() {
  return <InfoPage title="Hakkımızda">
    <p>SETRA, modern tesettür giyim koleksiyonlarını çevrimiçi mağazasında sunar. Ürünleri, renkleri ve beden seçeneklerini koleksiyon sayfalarımızdan inceleyebilirsiniz.</p>
    <p><Link className="font-medium text-foreground underline" href="/urunler">Koleksiyonu keşfedin</Link> veya sorularınız için <Link className="font-medium text-foreground underline" href="/iletisim">bize ulaşın</Link>.</p>
  </InfoPage>
}
