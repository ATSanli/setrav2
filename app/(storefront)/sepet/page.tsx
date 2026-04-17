import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { CartContent } from './cart-content'

export const metadata: Metadata = {
  title: 'Sepetim',
  description: 'Alışveriş sepetinizi görüntüleyin ve satın alın.'
}

export default function CartPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <nav className="mb-4">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Ana Sayfa
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <li className="font-medium">Sepetim</li>
            </ol>
          </nav>
          <h1 className="font-serif text-3xl">Sepetim</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <CartContent />
      </div>
    </div>
  )
}
