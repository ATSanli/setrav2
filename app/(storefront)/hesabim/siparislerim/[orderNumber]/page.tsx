import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { orderWhatsAppUrl } from '@/lib/store-links'

export const metadata: Metadata = { title: 'Sipariş Detayı', robots: { index: false } }

export default async function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) notFound()
  const { orderNumber } = await params
  const order = await prisma.order.findFirst({ where: { orderNumber, userId: session.user.id }, include: { items: true, address: true } })
  if (!order) notFound()

  return <div className="space-y-6">
    <Link className="text-sm underline" href="/hesabim/siparislerim">← Siparişlerim</Link>
    <h2 className="font-serif text-2xl">Sipariş {order.orderNumber}</h2>
    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('tr-TR')} · {order.status}</p>
    <div className="space-y-3 border-y py-5">
      {order.items.map(item => <div key={item.id} className="flex justify-between gap-4 text-sm"><div><p className="font-medium">{item.productName}</p><p className="text-muted-foreground">{item.variantInfo} · {item.quantity} adet</p></div><span>{formatPrice(Number(item.price) * item.quantity)}</span></div>)}
    </div>
    <div className="flex justify-between font-medium"><span>Toplam</span><span>{formatPrice(Number(order.total))}</span></div>
    <div><h3 className="font-medium">Teslimat adresi</h3><p className="text-sm text-muted-foreground">{order.address.fullName}, {order.address.address}, {order.address.district}, {order.address.city}</p></div>
    <a className="inline-block border px-5 py-3 text-sm" href={orderWhatsAppUrl(`Merhaba, ${order.orderNumber} numaralı siparişim hakkında bilgi almak istiyorum.`)} target="_blank" rel="noopener noreferrer">Sipariş hakkında WhatsApp ile sor</a>
  </div>
}
