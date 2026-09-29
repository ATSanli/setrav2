import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPage } from '@/components/content/info-page'

export const metadata: Metadata = { title: 'Beden Rehberi', alternates: { canonical: '/beden-rehberi' } }

export default function SizeGuidePage() {
  return <InfoPage title="Beden Rehberi">
    <p>Kalıp ve kumaş ürünlere göre değişebilir. Ürün açıklamasındaki ölçü ve kalıp bilgisini kontrol edin; beden seçiminizden emin değilseniz ürün adını belirterek destek ekibimize danışın.</p>
    <p><Link className="font-medium text-foreground underline" href="/iletisim">Beden konusunda destek alın</Link></p>
  </InfoPage>
}
