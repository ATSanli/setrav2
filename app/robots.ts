import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/super-admin/', '/hesabim/', '/sepet', '/odeme', '/giris', '/kayit', '/favoriler', '/favorites'] },
    sitemap: 'https://setraofficial.com/sitemap.xml'
  }
}
