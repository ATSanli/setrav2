import { Suspense } from 'react'
import Link from 'next/link'
import { Search, Eye, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { translations } from '@/translations'
import OrderActions from '@/components/admin/order-actions'

function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string, className: string }> = {
    PENDING: { label: translations.tr.status_pending ?? 'Beklemede', className: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: translations.tr.status_confirmed ?? 'Onaylandı', className: 'bg-blue-100 text-blue-800' },
    PROCESSING: { label: translations.tr.status_processing ?? 'Hazırlanıyor', className: 'bg-purple-100 text-purple-800' },
    SHIPPED: { label: translations.tr.status_shipped ?? 'Kargoda', className: 'bg-indigo-100 text-indigo-800' },
    DELIVERED: { label: translations.tr.status_delivered ?? 'Teslim Edildi', className: 'bg-green-100 text-green-800' },
    CANCELLED: { label: translations.tr.status_cancelled ?? 'İptal', className: 'bg-red-100 text-red-800' },
  }

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

async function getOrders() {
  try {
    // Match the dashboard's working query: only include basic user and items info
    const orders = await prisma.order.findMany({
      take: 0, // will be overridden if we want all; keep as example of minimal query
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { select: { quantity: true } }
      }
    })

    // If above succeeded (it should), fetch all orders with same include (no deep product relations)
    const full = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { select: { quantity: true } },
        address: true
      }
    })

    const sanitized = (full as any[]).map((order) => ({
      ...order,
      discount: order.discount ?? 0,
      couponCode: 'couponCode' in order ? order.couponCode ?? null : null,
      createdAtString: order.createdAt instanceof Date ? order.createdAt.toISOString() : String(order.createdAt),
    }))

    return { orders: sanitized, error: null }
  } catch (error) {
    console.error('Admin getOrders error (full):', error)

    // Fallback: minimal fetch to avoid relation-caused crashes
    try {
      const minimal = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true, email: true } },
          _count: { select: { items: true } }
        }
      })

      const mapped = minimal.map((o: any) => ({
        ...o,
        items: Array.from({ length: o._count?.items ?? 0 }).map(() => ({ quantity: 1 })),
        createdAtString: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt)
      }))

      return { orders: mapped, error: null }
    } catch (err) {
      console.error('Admin getOrders error (fallback minimal):', err)
      return { orders: [], error: (err as Error)?.message ?? 'Unknown error' }
    }
  }
}

async function OrdersTable() {
  const { orders, error } = await getOrders()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{translations.tr.orders} ({orders.length})</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={translations.tr.admin_search_placeholder}
              className="pl-10 w-64"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{translations.tr.orders_fetch_failed ?? 'Siparişler yüklenirken hata oluştu'}</p>
          </div>
        ) : orders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{translations.tr.order_label ?? 'Sipariş'}</TableHead>
                <TableHead>{translations.tr.customer_label ?? 'Müşteri'}</TableHead>
                <TableHead>{translations.tr.items_label ?? 'Ürünler'}</TableHead>
                <TableHead>{translations.tr.total_label ?? 'Toplam'}</TableHead>
                <TableHead>{translations.tr.status_label ?? 'Durum'}</TableHead>
                <TableHead>{translations.tr.date_label ?? 'Tarih'}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link href={`/admin/siparisler/${order.id}`} className="block">
                      <p className="font-medium">{order.orderNumber}</p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/siparisler/${order.id}`} className="block">
                      <div>
                        <p className="font-medium">{
                          (((order.user?.firstName ?? '') + ' ' + (order.user?.lastName ?? '')).trim())
                          || order.user?.email
                          || translations.tr.guest_user
                          || 'Misafir Kullanıcı'
                        }</p>
                        <p className="text-sm text-muted-foreground">
                          {order.user?.email || order.guestEmail || '-'}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/siparisler/${order.id}`} className="block">
                      <p className="text-sm">
                        {(order.items?.length ?? 0)} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/siparisler/${order.id}`} className="block">
                      <p className="font-medium">{formatPrice(Number(order.total))}</p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/siparisler/${order.id}`} className="block">
                      <OrderStatusBadge status={order.status} />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/siparisler/${order.id}`} className="block">
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAtString ?? order.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <OrderActions id={order.id} status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminOrdersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrdersTable />
      </Suspense>
    </div>
  )
}

function OrdersTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-48 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
