import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CheckoutForm } from './checkout-form'

export const metadata: Metadata = {
  title: 'Ödeme',
  description: 'Siparişinizi tamamlayın.'
}

async function getUserAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
  })
}

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/giris?redirect=/odeme')
  }

  const addresses = await getUserAddresses(session.user.id)

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <nav>
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Ana Sayfa
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <li>
                <Link href="/sepet" className="text-muted-foreground hover:text-foreground">
                  Sepet
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <li className="font-medium">Ödeme</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl mb-8">Ödeme</h1>
        <CheckoutForm
          addresses={addresses.map(a => ({
            id: a.id,
            title: a.title,
            fullName: a.fullName,
            phone: a.phone,
            address: a.address,
            city: a.city,
            district: a.district,
            postalCode: a.postalCode,
            isDefault: a.isDefault
          }))}
        />
      </div>
    </div>
  )
}
