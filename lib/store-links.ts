export const TRENDYOL_STORE_URL = 'https://www.trendyol.com/magaza/setra-official-m-1261085?sst=0'

export const ORDER_WHATSAPP_NUMBER = '0541 456 09 56'
export const SUPPORT_WHATSAPP_NUMBER = '0506 984 31 95'

const ORDER_WHATSAPP_BASE_URL = 'https://wa.me/905414560956'
export const SUPPORT_WHATSAPP_URL = 'https://wa.me/905069843195'

export function orderWhatsAppUrl(message?: string) {
  return message ? `${ORDER_WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}` : ORDER_WHATSAPP_BASE_URL
}
