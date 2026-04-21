'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { translations } from '@/translations'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FolderTree,
  Settings,
  BarChart3,
  ImageIcon,
  Tags,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: translations.tr.dashboard, href: '/admin', icon: LayoutDashboard },
  { name: translations.tr.products || 'Ürünler', href: '/admin/urunler', icon: Package },
  { name: translations.tr.newsletter_title || 'Bülten', href: '/admin/newsletter', icon: MessageSquare },
  { name: translations.tr.categories || 'Kategoriler', href: '/admin/kategoriler', icon: FolderTree },
  { name: translations.tr.orders || 'Siparişler', href: '/admin/siparisler', icon: ShoppingCart },
  { name: translations.tr.customers || 'Müşteriler', href: '/admin/musteriler', icon: Users },
  { name: translations.tr.reviews || 'Değerlendirmeler', href: '/admin/yorumlar', icon: MessageSquare },
  { name: translations.tr.analytics || 'Analitik', href: '/admin/analitik', icon: BarChart3 },
  { name: translations.tr.media || 'Medya', href: '/admin/medya', icon: ImageIcon },
  { name: translations.tr.settings || 'Ayarlar', href: '/admin/ayarlar', icon: Settings },
  { name: translations.tr.users || 'Kullanıcılar', href: '/admin/users', icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // Debug: log the current user role
  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line no-console
      console.log('AdminSidebar - session role:', session?.user?.role, 'status:', status)
    } catch (e) {}
  }

  // Determine role permissions from session.user.permissions
  const sessionPerms = (session && (session.user as any).permissions) || []
  const isSuper = session && session.user?.role === 'SUPER_ADMIN'
  const showPermissions = isSuper
  const showProducts = isSuper || sessionPerms.includes('product_create') || sessionPerms.includes('product_edit') || sessionPerms.includes('product_delete') || sessionPerms.includes('stock_manage')

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 bg-primary text-primary-foreground lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-primary-foreground/10">
          <Link href="/admin" className="font-serif text-2xl tracking-[0.2em]">
            SETRA
          </Link>
          <span className="ml-2 text-xs uppercase tracking-widest text-primary-foreground/60">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            if (item.href === '/admin/urunler' && !showProducts) return null
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary-foreground/10 text-primary-foreground' 
                    : 'text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
          {showProducts ? null : null}
          {showPermissions && (
            <>
              <Link
                key="Müşteriler"
                href="/admin/musteriler"
                className={cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === '/admin/musteriler'
                    ? 'bg-primary-foreground/10 text-primary-foreground'
                    : 'text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground'
                )}
              >
                <Users className="h-5 w-5" />
                Müşteriler
              </Link>
              <Link
                key="Roles"
                href="/super-admin/roles"
                className={cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === '/super-admin/roles'
                    ? 'bg-primary-foreground/10 text-primary-foreground'
                    : 'text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground'
                )}
              >
                <Settings className="h-5 w-5" />
                Roles
              </Link>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-primary-foreground/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <span>{translations.tr.view_store}</span>
            <span className="text-xs">→</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
