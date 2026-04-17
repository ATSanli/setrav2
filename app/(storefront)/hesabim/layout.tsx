import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { ChevronRight, User, Package, Heart, MapPin, Settings, LogOut } from 'lucide-react'
import { authOptions } from '@/lib/auth'

const sidebarLinks = [
  { name: 'Hesap Bilgilerim', href: '/hesabim', icon: User },
  { name: 'Siparişlerim', href: '/hesabim/siparislerim', icon: Package },
  { name: 'Favorilerim', href: '/hesabim/favorilerim', icon: Heart },
  { name: 'Adreslerim', href: '/hesabim/adreslerim', icon: MapPin },
  { name: 'Ayarlar', href: '/hesabim/ayarlar', icon: Settings },
]

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/giris?redirect=/hesabim')
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-8">
          <nav className="mb-4">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Ana Sayfa
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <li className="font-medium">Hesabım</li>
            </ol>
          </nav>
          <h1 className="font-serif text-3xl">Hesabım</h1>
          <p className="text-muted-foreground mt-1">
            Hoş geldiniz, {session.user.firstName}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-background rounded-sm p-4 space-y-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm hover:bg-secondary transition-colors"
                >
                  <link.icon className="h-4 w-4 text-muted-foreground" />
                  {link.name}
                </Link>
              ))}
              <Link
                href="/api/auth/signout"
                className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm hover:bg-secondary text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </Link>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1">
            <div className="bg-background rounded-sm p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
