import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'

interface Props {
  params: Promise<{ orderNumber: string }>
}

export const metadata: Metadata = {
  title: 'Sipariş Onayı',
  description: 'Siparişiniz başarıyla oluşturuldu.'
}

async function getOrder(orderNumber: string, userId: string) {
  return prisma.order.findFirst({
    where: {
      orderNumber,
      userId
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1 }
            }
          }
        }
      },
      address: true
    }
  })
}

export default async function OrderConfirmationPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  const { orderNumber } = await params

  if (!session) {
    notFound()
  }

  const order = await getOrder(orderNumber, session.user.id)

  if (!order) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="font-serif text-3xl mb-2">Siparişiniz Alındı!</h1>
            <p className="text-muted-foreground">
              Sipariş numaranız: <span className="font-medium text-foreground">{order.orderNumber}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Sipariş detaylarını e-posta adresinize gönderdik.
            </p>
          </div>

          {/* Order details */}
          <div className="bg-background rounded-sm p-6 space-y-6">
            {/* Delivery info */}
            <div>
              <h2 className="font-medium mb-3">Teslimat Adresi</h2>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{order.address.fullName}</p>
                <p>{order.address.address}</p>
                <p>{order.address.district}, {order.address.city} {order.address.postalCode}</p>
                <p>{order.address.phone}</p>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div>
              <h2 className="font-medium mb-4">Sipariş Detayları</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-20 bg-secondary flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.product.images[0]?.url || '/images/placeholder.jpg'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{item.variantInfo}</p>
                      <p className="text-sm text-muted-foreground">Adet: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ara Toplam</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kargo</span>
                <span className={Number(order.shippingCost) === 0 ? 'text-accent' : ''}>
                  {Number(order.shippingCost) === 0 ? 'Ücretsiz' : formatPrice(Number(order.shippingCost))}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium text-base">
                <span>Toplam</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>
            </div>

            <Separator />

            {/* Payment method */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ödeme Yöntemi</span>
              <span>Kapıda Ödeme</span>
            </div>

            {/* Order note */}
            {order.note && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground">Sipariş Notu:</span>
                  <p className="text-sm mt-1">{order.note}</p>
                </div>
              </>
            )}
          </div>

          {/* Next steps */}
          <div className="bg-background rounded-sm p-6 mt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Sonraki Adımlar</h3>
                <p className="text-sm text-muted-foreground">
                  Siparişiniz en kısa sürede hazırlanıp kargoya verilecektir. 
                  Kargo takip numarası SMS ve e-posta ile tarafınıza iletilecektir.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button asChild className="flex-1">
              <Link href="/hesabim/siparislerim">
                Siparişlerimi Görüntüle
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                Alışverişe Devam Et
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
