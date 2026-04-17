import { getServerSession } from 'next-auth'
import { Metadata } from 'next'
import Link from 'next/link'
import { Package, Heart, MapPin, ChevronRight } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Hesabım'
}

async function getUserStats(userId: string) {
  const [orderCount, wishlistCount, addressCount, recentOrders] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.wishlistItem.count({ where: { userId } }),
    prisma.address.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
  ])

  return { orderCount, wishlistCount, addressCount, recentOrders }
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return null
  }

  const { orderCount, wishlistCount, addressCount, recentOrders } = await getUserStats(session.user.id)

  const statusLabels: Record<string, string> = {
    PENDING: 'Beklemede',
    CONFIRMED: 'Onaylandı',
    PROCESSING: 'Hazırlanıyor',
    SHIPPED: 'Kargoda',
    DELIVERED: 'Teslim Edildi',
    CANCELLED: 'İptal Edildi'
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="font-serif text-2xl mb-2">
          Hoş Geldiniz, {session.user.firstName}!
        </h2>
        <p className="text-muted-foreground">
          Hesap bilgilerinizi görüntüleyebilir ve siparişlerinizi takip edebilirsiniz.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/hesabim/siparislerim"
          className="flex items-center gap-4 p-4 border rounded-sm hover:border-primary transition-colors"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-medium">{orderCount}</p>
            <p className="text-sm text-muted-foreground">Sipariş</p>
          </div>
        </Link>

        <Link
          href="/hesabim/favorilerim"
          className="flex items-center gap-4 p-4 border rounded-sm hover:border-primary transition-colors"
        >
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
            <Heart className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-medium">{wishlistCount}</p>
            <p className="text-sm text-muted-foreground">Favori</p>
          </div>
        </Link>

        <Link
          href="/hesabim/adreslerim"
          className="flex items-center gap-4 p-4 border rounded-sm hover:border-primary transition-colors"
        >
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-medium">{addressCount}</p>
            <p className="text-sm text-muted-foreground">Adres</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl">Son Siparişler</h3>
          <Link
            href="/hesabim/siparislerim"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            Tümünü Gör
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/hesabim/siparislerim/${order.orderNumber}`}
                className="flex items-center justify-between p-4 border rounded-sm hover:border-primary transition-colors"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')} - {order.items.length} ürün
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(Number(order.total))}</p>
                  <p className="text-sm text-muted-foreground">
                    {statusLabels[order.status]}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Henüz siparişiniz bulunmamaktadır.
          </p>
        )}
      </div>

      {/* Account Info */}
      <div>
        <h3 className="font-serif text-xl mb-4">Hesap Bilgileri</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Ad Soyad</p>
            <p className="font-medium">{session.user.firstName} {session.user.lastName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">E-posta</p>
            <p className="font-medium">{session.user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
