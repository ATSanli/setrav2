import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPage } from '@/components/content/info-page'

export const metadata: Metadata = { title: 'Gizlilik Politikası', alternates: { canonical: '/gizlilik-politikasi' } }

export default function PrivacyPage() {
  return <InfoPage title="Gizlilik Politikası">
    <p>SETRA, hesap oluşturma ve sipariş işlemleri için sağladığınız iletişim, adres ve sipariş bilgilerini bu hizmetleri sunmak amacıyla işler. Bültene katılırsanız e-posta adresiniz kampanya duyuruları için kaydedilir.</p>
    <p>Hesap oturumunuz ve sepetinizin çalışması için çerezler kullanılır. Ödeme ve teslimat süreçlerinde gerekli bilgiler ilgili hizmet sağlayıcılarla paylaşılabilir.</p>
    <p>Verilerinizle ilgili talep veya sorularınız için <Link className="font-medium text-foreground underline" href="/iletisim">iletişim kanallarımızdan</Link> bize ulaşın.</p>
  </InfoPage>
}
