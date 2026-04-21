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
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true } }
          }
        },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Sanitize results: defaults for missing fields and safe product fallback
    const sanitized = (orders as any[]).map((order) => ({
      ...order,
      discount: order.discount ?? 0,
      couponCode: 'couponCode' in order ? order.couponCode ?? null : null,
      createdAtString: order.createdAt instanceof Date ? order.createdAt.toISOString() : String(order.createdAt),
      items: (order.items || []).map((it: any) => ({
        ...it,
        product: it.product ?? { id: null, name: translations.tr.deleted_product ?? 'Deleted product' }
      }))
    }))

    return { orders: sanitized, error: null }
  } catch (error) {
    console.error('Admin getOrders error:', error)
    return { orders: [], error: (error as Error)?.message ?? 'Unknown error' }
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
                    <p className="font-medium">{order.orderNumber}</p>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.user?.name || 'Guest'}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.user?.email || order.guestEmail || '-'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{formatPrice(Number(order.total))}</p>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAtString ?? order.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/siparisler/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
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
