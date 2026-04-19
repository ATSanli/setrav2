import { Suspense } from 'react'
import Link from 'next/link'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { translations } from '@/translations'

async function getStats() {
  try {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      recentOrders,
      totalRevenue,
      pendingOrders
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: { select: { quantity: true } }
        }
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ['DELIVERED', 'SHIPPED'] } }
      }),
      prisma.order.count({ where: { status: 'PENDING' } })
    ])

    return {
      totalProducts,
      totalOrders,
      totalCustomers,
      recentOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      recentOrders: [],
      totalRevenue: 0,
      pendingOrders: 0
    }
  }
}

function StatCard({ 
  title, 
  value, 
  change, 
  changeType,
  icon: Icon,
  href
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative'
  icon: React.ElementType
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {change && (
            <p className={`text-xs flex items-center gap-1 mt-1 ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'positive' ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {change} from last month
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string, className: string }> = {
    PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
    PROCESSING: { label: 'Processing', className: 'bg-purple-100 text-purple-800' },
    SHIPPED: { label: 'Shipped', className: 'bg-indigo-100 text-indigo-800' },
    DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  }

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

async function DashboardContent() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={translations.tr.total_revenue ?? 'Toplam Gelir'}
          value={formatPrice(Number(stats.totalRevenue))}
          change="+12.5%"
          changeType="positive"
          icon={TrendingUp}
          href="/admin/analitik"
        />
        <StatCard
          title={translations.tr.total_orders ?? 'Toplam Sipariş'}
          value={stats.totalOrders}
          change="+8.2%"
          changeType="positive"
          icon={ShoppingCart}
          href="/admin/siparisler"
        />
        <StatCard
          title={translations.tr.total_products ?? 'Toplam Ürün'}
          value={stats.totalProducts}
          icon={Package}
          href="/admin/urunler"
        />
        <StatCard
          title={translations.tr.total_customers ?? 'Toplam Müşteri'}
          value={stats.totalCustomers}
          change="+15.3%"
          changeType="positive"
          icon={Users}
          href="/admin/musteriler"
        />
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{translations.tr.quick_actions}</CardTitle>
            <CardDescription>{translations.tr.common_tasks}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Button asChild variant="outline" className="h-auto py-4 justify-start">
              <Link href="/admin/urunler/yeni">
                <Package className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{translations.tr.add_product}</div>
                  <div className="text-xs text-muted-foreground">{translations.tr.create_new_product}</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 justify-start">
              <Link href="/admin/siparisler?status=PENDING">
                <ShoppingCart className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{translations.tr.pending_orders_label}</div>
                  <div className="text-xs text-muted-foreground">{stats.pendingOrders}{translations.tr.pending_orders_info_suffix}</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 justify-start">
              <Link href="/admin/kategoriler/yeni">
                <Package className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Add Category</div>
                  <div className="text-xs text-muted-foreground">Create new category</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 justify-start">
              <Link href="/admin/urunler/import">
                <Package className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Import Products</div>
                  <div className="text-xs text-muted-foreground">CSV bulk import</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{translations.tr.recent_orders}</CardTitle>
              <CardDescription>{translations.tr.latest_customer_orders}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/siparisler">{translations.tr.view_all}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <Link 
                    key={order.id} 
                    href={`/admin/siparisler/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {(((order.user?.firstName ?? '') + ' ' + (order.user?.lastName ?? '')).trim()) || order.user?.email || 'Guest'}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">{formatPrice(Number(order.total))}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No orders yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif">{translations.tr.dashboard}</h1>
        <p className="text-muted-foreground">{translations.tr.welcome_back_admin}</p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
