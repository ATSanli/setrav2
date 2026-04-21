import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/translations'
import OrderActions from '@/components/admin/order-actions'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  await requirePermission('order_manage')

  const { id } = params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      address: true,
      items: { include: { product: true, variant: true } }
    }
  })

  if (!order) return (<div>Not found</div>)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{translations.tr.order_label} {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString('tr-TR')}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderActions id={order.id} status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <section className="col-span-2 bg-slate-900 p-4 rounded">
          <h2 className="text-lg font-medium mb-4">Müşteri & Adres</h2>
          <div className="mb-4">
            <p className="font-medium">{order.user?.firstName} {order.user?.lastName}</p>
            <p className="text-sm text-muted-foreground">{order.user?.email}</p>
            <p className="text-sm text-muted-foreground">{order.user?.phone}</p>
          </div>

          <div>
            <p className="font-medium">{order.address?.fullName}</p>
            <p className="text-sm">{order.address?.address}</p>
            <p className="text-sm">{order.address?.city} / {order.address?.district} {order.address?.postalCode}</p>
            <p className="text-sm">{order.address?.phone}</p>
          </div>

          <h2 className="text-lg font-medium mt-6 mb-3">Sipariş Ürünleri</h2>
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-800 rounded">
                <div className="w-16 h-16 bg-slate-700 rounded overflow-hidden">
                  {/* product image could be empty; show placeholder */}
                  {/* If product.images exist, we'd show; using product relation may not include images */}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">{item.variantInfo}</p>
                </div>
                <div className="w-40 text-right">
                  <p className="font-medium">{formatPrice(Number(item.price))}</p>
                  <p className="text-sm text-muted-foreground">Adet: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="bg-slate-900 p-4 rounded">
          <h3 className="text-lg font-medium mb-4">Ödeme Özeti</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Ara Toplam</span><span>{formatPrice(Number(order.subtotal))}</span></div>
            <div className="flex justify-between"><span>İndirim</span><span>-{formatPrice(Number(order.discount || 0))}</span></div>
            {('couponCode' in order) && order['couponCode'] ? (
              <div className="flex justify-between"><span>Kupon</span><span>{order['couponCode']}</span></div>
            ) : null}
            <div className="flex justify-between font-semibold"><span>Genel Toplam</span><span>{formatPrice(Number(order.total))}</span></div>
            <div className="mt-4">
              <p className="text-sm">Durum: {order.status}</p>
              <p className="text-sm text-muted-foreground">Not: {order.note || '-'}</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6">
        <Link href="/admin/siparisler" className="text-sm text-muted-foreground">← Back to orders</Link>
      </div>
    </div>
  )
}
