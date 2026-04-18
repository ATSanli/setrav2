'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  User, 
  Heart, 
  ShoppingBag, 
  Menu, 
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCart } from '@/hooks/use-cart'
import { SearchDialog } from '@/components/search-dialog'
import { cn } from '@/lib/utils'
import { useT, useLanguage } from '@/components/providers/language-provider'

const categories = [
  /* { name: 'Ferace', slug: 'ferace' }, */
  { name: 'Elbise', slug: 'elbise' },
  { name: 'Takım', slug: 'takim' },
  { name: 'Şal & Eşarp', slug: 'sal-esarp' },
   /* { name: 'Aksesuar', slug: 'aksesuar' }, */
]

export function Header() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const { itemCount } = useCart()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Check if we're on homepage for transparent header
  const isHomepage = pathname === '/'

  const t = useT()
  const { language, setLanguage } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Determine if header should be solid
      setScrolled(currentScrollY > 50)
      
      // Hide/show header based on scroll direction (only after scrolling past hero)
      if (currentScrollY > 500) {
        setHidden(currentScrollY > lastScrollY && currentScrollY > 100)
      } else {
        setHidden(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const headerBg = isHomepage && !scrolled 
    ? 'bg-transparent' 
    : 'bg-background/95 backdrop-blur-md border-b border-border'

  const textColor = isHomepage && !scrolled 
    ? 'text-white' 
    : 'text-foreground'

  const logoColor = isHomepage && !scrolled 
    ? 'text-white' 
    : 'text-foreground'

  

  return (
    <>
      <motion.header 
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          headerBg,
          hidden ? '-translate-y-full' : 'translate-y-0'
        )}
        initial={{ y: -100 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Top bar - only show when scrolled or not homepage */}
        <AnimatePresence>
          {(scrolled || !isHomepage) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-primary text-primary-foreground text-center py-2 text-xs uppercase tracking-widest overflow-hidden"
            >
              <p>{t('shipping')}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className={textColor}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t('open_menu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-md bg-background p-0">
                <SheetTitle className="sr-only">{t('navigation_menu')}</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Mobile menu header */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <Link 
                      href="/" 
                      className="font-serif text-2xl tracking-[0.2em]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      SETRA
                    </Link>
                  </div>

                  {/* Mobile menu links */}
                  <nav className="flex-1 p-6">
                    <div className="space-y-1">
                      {categories.map((category, i) => (
                        <motion.div
                          key={category.slug}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Link
                            href={`/kategori/${category.slug}`}
                            className="block py-4 text-2xl font-serif hover:text-accent transition-colors border-b border-border/50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {category.name}
                          </Link>
                        </motion.div>
                      ))}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: categories.length * 0.1 }}
                      >
                        <Link
                          href="/yeni-gelenler"
                          className="block py-4 text-2xl font-serif text-accent border-b border-border/50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {t('new_arrivals')}
                        </Link>
                      </motion.div>
                    </div>
                  </nav>

                  {/* Mobile menu footer */}
                  <div className="p-6 border-t bg-secondary/30">
                    <div className="flex items-center gap-4 mb-4">
                      {status === 'loading' ? (
                        <div className="hidden sm:flex items-center" />
                      ) : isAuthenticated ? (
                        <Link 
                          href="/hesabim" 
                          className="flex items-center gap-2 text-sm"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          {t('my_account')}
                        </Link>
                      ) : (
                        <Link 
                          href="/giris" 
                          className="flex items-center gap-2 text-sm"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          {t('sign_in')}
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <Link 
                        href="/favoriler" 
                        className="flex items-center gap-2 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Heart className="h-5 w-5" />
                        {t('wishlist')}
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link 
              href="/" 
              className={cn(
                'font-serif text-2xl lg:text-3xl tracking-[0.3em] font-medium transition-colors duration-300',
                logoColor
              )}
            >
              SETRA
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/kategori/${category.slug}`}
                  className={cn(
                    'text-sm uppercase tracking-[0.15em] hover:opacity-70 transition-all duration-300 relative group',
                    textColor
                  )}
                >
                  {category.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-current transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
              <Link
                href="/yeni-gelenler"
                className={cn(
                  'text-sm uppercase tracking-[0.15em] font-medium relative group',
                  isHomepage && !scrolled ? 'text-accent' : 'text-accent'
                )}
              >
                {t('new')}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 lg:gap-3">
              <div className="hidden sm:flex items-center pr-2">
                <button
                  onClick={() => setLanguage('tr')}
                  aria-pressed={language === 'tr'}
                  className={cn(
                    'text-sm px-2 py-1 rounded transition-colors',
                    language === 'tr' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                  )}
                >
                  TR
                </button>
                <span className="text-xs text-muted-foreground px-2">|</span>
                <button
                  onClick={() => setLanguage('en')}
                  aria-pressed={language === 'en'}
                  className={cn(
                    'text-sm px-2 py-1 rounded transition-colors',
                    language === 'en' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                  )}
                >
                  EN
                </button>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSearchOpen(true)}
                className={cn('hover:bg-transparent hover:opacity-70', textColor)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">{t('search')}</span>
              </Button>

              {status === 'loading' ? (
                <div className="hidden sm:flex items-center" />
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn('hidden sm:flex hover:bg-transparent hover:opacity-70', textColor)}
                    >
                      <User className="h-5 w-5" />
                      <span className="sr-only">Hesabım</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/hesabim">{t('my_account')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/hesabim/siparislerim">{t('orders')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/hesabim/favorilerim">{t('wishlist')}</Link>
                    </DropdownMenuItem>
                      {(session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">{t('admin_panel')}</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/api/auth/signout">{t('sign_out')}</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  asChild 
                  className={cn('hidden sm:flex hover:bg-transparent hover:opacity-70', textColor)}
                >
                    <Link href="/giris">
                        <User className="h-5 w-5" />
                        <span className="sr-only">{t('sign_in')}</span>
                      </Link>
                </Button>
              )}

              <Button 
                variant="ghost" 
                size="icon" 
                asChild 
                className={cn('hidden sm:flex hover:bg-transparent hover:opacity-70', textColor)}
              >
                <Link href="/favoriler">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">{t('wishlist')}</span>
                </Link>
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className={cn('relative hover:bg-transparent hover:opacity-70', textColor)} 
                asChild
              >
                <Link href="/sepet">
                  <ShoppingBag className="h-5 w-5" />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium"
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className="sr-only">{t('cart_sr')}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Spacer for fixed header - only on non-homepage */}
      {!isHomepage && <div className="h-16 lg:h-20" />}

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
