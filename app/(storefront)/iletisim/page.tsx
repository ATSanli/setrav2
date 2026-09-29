import type { Metadata } from 'next'
import { InfoPage } from '@/components/content/info-page'
import { ORDER_WHATSAPP_NUMBER, SUPPORT_WHATSAPP_NUMBER, SUPPORT_WHATSAPP_URL, orderWhatsAppUrl } from '@/lib/store-links'

export const metadata: Metadata = { title: 'İletişim', alternates: { canonical: '/iletisim' } }

export default function ContactPage() {
  return <InfoPage title="İletişim">
    <p>Ürün, sipariş ve iade konularında bize WhatsApp üzerinden ulaşabilirsiniz.</p>
    <p><a className="font-medium text-foreground underline" href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Destek hattı: {SUPPORT_WHATSAPP_NUMBER}</a></p>
    <p><a className="font-medium text-foreground underline" href={orderWhatsAppUrl('Merhaba, SETRA siparişim hakkında bilgi almak istiyorum.')} target="_blank" rel="noopener noreferrer">Sipariş hattı: {ORDER_WHATSAPP_NUMBER}</a></p>
  </InfoPage>
}
