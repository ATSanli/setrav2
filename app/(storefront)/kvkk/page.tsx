import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPage } from '@/components/content/info-page'

export const metadata: Metadata = { title: 'KVKK Bilgilendirmesi', alternates: { canonical: '/kvkk' } }

export default function KvkkPage() {
  return <InfoPage title="KVKK Bilgilendirmesi">
    <p>SETRA mağazasında hesap, sipariş, teslimat ve destek süreçlerinde paylaştığınız kişisel bilgiler bu işlemlerin yürütülmesi için kullanılır. Bülten kaydı isteğe bağlıdır.</p>
    <p>Bilgilerinize ilişkin erişim, düzeltme veya silme talebinizi <Link className="font-medium text-foreground underline" href="/iletisim">iletişim kanallarımızdan</Link> iletebilirsiniz. Kimlik doğrulaması gereken talepler güvenli biçimde değerlendirilir.</p>
  </InfoPage>
}
