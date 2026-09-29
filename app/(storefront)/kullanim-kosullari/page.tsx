import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPage } from '@/components/content/info-page'

export const metadata: Metadata = { title: 'Kullanım Koşulları', alternates: { canonical: '/kullanim-kosullari' } }

export default function TermsPage() {
  return <InfoPage title="Kullanım Koşulları">
    <p>Ürünlerin güncel fiyat ve stok bilgisi ürün sayfasında gösterilir. Siparişin tamamlanması için sepet, teslimat adresi ve ödeme adımlarındaki bilgilerin doğru girilmesi gerekir.</p>
    <p>İade ve sipariş konularında destek almak için <Link className="font-medium text-foreground underline" href="/iletisim">iletişim sayfamızı</Link> kullanabilirsiniz. Hesap güvenliğiniz için giriş bilgilerinizi üçüncü kişilerle paylaşmayın.</p>
  </InfoPage>
}
