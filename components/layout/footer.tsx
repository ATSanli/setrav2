"use client"

import Link from 'next/link'
import { Instagram, Facebook, Twitter } from 'lucide-react'
import { useT } from '@/components/providers/language-provider'

const footerLinks = {
  shop: [
    { name: 'Ferace', href: '/kategori/ferace' },
    { name: 'Elbise', href: '/kategori/elbise' },
    { name: 'Takım', href: '/kategori/takim' },
    { name: 'Şal & Eşarp', href: '/kategori/sal-esarp' },
    { name: 'Aksesuar', href: '/kategori/aksesuar' },
    { name: 'Yeni Gelenler', href: '/yeni-gelenler' },
  ],
  help: [
    { name: 'Sipariş Takibi', href: '/siparis-takibi' },
    { name: 'İade & Değişim', href: '/iade-degisim' },
    { name: 'Kargo Bilgileri', href: '/kargo-bilgileri' },
    { name: 'Beden Rehberi', href: '/beden-rehberi' },
    { name: 'SSS', href: '/sss' },
  ],
  about: [
    { name: 'Hakkımızda', href: '/hakkimizda' },
    { name: 'Mağazalarımız', href: '/magazalarimiz' },
    { name: 'Kariyer', href: '/kariyer' },
    { name: 'İletişim', href: '/iletisim' },
  ],
  legal: [
    { name: 'Gizlilik Politikası', href: '/gizlilik-politikasi' },
    { name: 'Kullanım Koşulları', href: '/kullanim-kosullari' },
    { name: 'KVKK', href: '/kvkk' },
  ],
}

export function Footer() {
  const t = useT()

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-serif text-2xl mb-3">{t('newsletter_title')}</h3>
            <p className="text-primary-foreground/70 mb-6">{t('newsletter_sub')}</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder={t('email_placeholder')}
                className="flex-1 px-4 py-3 bg-transparent border border-primary-foreground/30 rounded-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary-foreground"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-foreground text-primary font-medium rounded-sm hover:bg-primary-foreground/90 transition-colors"
              >
                {t('subscribe')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">
              {t('footer_shop')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">
              {t('footer_help')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">
              {t('footer_about')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">
              {t('footer_legal')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-serif text-xl tracking-[0.2em]">
                SETRA
              </Link>
              <div className="flex items-center gap-4">
                <a
                  href="https://instagram.com/setraofficialtr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors flex items-center gap-2"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram @setraofficialtr</span>
                  <span className="hidden sm:inline ml-2 text-sm">@setraofficialtr</span>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
              </div>
            </div>
            <p className="text-primary-foreground/50 text-sm">
              &copy; {new Date().getFullYear()} SETRA. {t('all_rights')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
