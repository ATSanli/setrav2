import { getServerSession } from 'next-auth'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Package, ChevronRight } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice, cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Siparişlerim'
}

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  PROCESSING: 'Hazırlanıyor',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi'
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1 }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return null
  }

  const orders = await getUserOrders(session.user.id)

  return (
    <div>
      <h2 className="font-serif text-2xl mb-6">Siparişlerim</h2>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/hesabim/siparislerim/${order.orderNumber}`}
              className="block border rounded-sm hover:border-primary transition-colors"
            >
              <div className="p-4 border-b bg-secondary/30 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Sipariş No</p>
                    <p className="font-medium">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tarih</p>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Toplam</p>
                    <p className="font-medium">{formatPrice(Number(order.total))}</p>
                  </div>
                </div>
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  statusColors[order.status]
                )}>
                  {statusLabels[order.status]}
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div
                        key={item.id}
                        className="relative w-12 h-16 bg-secondary border-2 border-background overflow-hidden"
                        style={{ zIndex: 3 - i }}
                      >
                        <Image
                          src={item.product.images[0]?.url || '/images/placeholder.jpg'}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-16 bg-secondary border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {order.items.map(i => i.productName).join(', ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} ürün
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-2">Henüz siparişiniz yok</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Alışverişe başlamak için ürünlerimize göz atın.
          </p>
          <Link
            href="/urunler"
            className="text-sm text-accent hover:underline"
          >
            Alışverişe Başla
          </Link>
        </div>
      )}
    </div>
  )
}
