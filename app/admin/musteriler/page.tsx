import { Suspense } from 'react'
import Link from 'next/link'
import { Search, Eye, Mail } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { translations } from '@/translations'

async function getCustomers() {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: { total: true },
          where: { status: { in: ['DELIVERED', 'SHIPPED'] } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return customers
  } catch {
    return []
  }
}

async function CustomersTable() {
  const customers = await getCustomers()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{translations.tr.customers} ({customers.length})</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={translations.tr.admin_search_placeholder}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {customers.length > 0 ? (
          <Table>
            <TableHeader>
                <TableRow>
                  <TableHead>{translations.tr.customer_label}</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>{translations.tr.orders_label}</TableHead>
                  <TableHead>{translations.tr.total_spent_label}</TableHead>
                  <TableHead>{translations.tr.joined_label}</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => {
                const totalSpent = customer.orders.reduce(
                  (sum, order) => sum + Number(order.total), 
                  0
                )
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {customer.name?.charAt(0) || customer.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name || 'No name'}</p>
                          {customer.phone && (
                            <p className="text-sm text-muted-foreground">{customer.phone}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{customer.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{customer._count.orders} orders</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{formatPrice(totalSpent)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`mailto:${customer.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/musteriler/${customer.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{translations.tr.no_customers_yet}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminCustomersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif">Customers</h1>
        <p className="text-muted-foreground">Manage your customer base</p>
      </div>

      <Suspense fallback={<CustomersTableSkeleton />}>
        <CustomersTable />
      </Suspense>
    </div>
  )
}

function CustomersTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-48 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
