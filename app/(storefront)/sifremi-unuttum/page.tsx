import type { Metadata } from 'next'
import { InfoPage } from '@/components/content/info-page'
import { SUPPORT_WHATSAPP_URL } from '@/lib/store-links'

export const metadata: Metadata = { title: 'Şifre Yardımı', robots: { index: false } }

export default function PasswordHelpPage() {
  return <InfoPage title="Şifre Yardımı">
    <p>Hesabınıza erişemiyorsanız destek ekibimizle iletişime geçin. Güvenliğiniz için şifrenizi mesajda paylaşmayın.</p>
    <p><a className="font-medium text-foreground underline" href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp desteğine ulaşın</a></p>
  </InfoPage>
}
