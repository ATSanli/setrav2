import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const base = 'https://setraofficial.com'
const staticPaths = ['/', '/urunler', '/yeni-gelenler', '/setra-tech', '/iletisim', '/hakkimizda', '/beden-rehberi', '/gizlilik-politikasi', '/kullanim-kosullari', '/kvkk']
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls = staticPaths.map(path => ({ url: `${base}${path}` }))
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.product.findMany({ where: { isActive: true, category: { isActive: true } }, select: { slug: true, updatedAt: true } })
    ])
    return [
      ...staticUrls,
      ...categories.map(category => ({ url: `${base}/kategori/${category.slug}`, lastModified: category.updatedAt })),
      ...products.map(product => ({ url: `${base}/urun/${product.slug}`, lastModified: product.updatedAt }))
    ]
  } catch (error) {
    console.error('Sitemap product/category lookup failed:', error)
    return staticUrls
  }
}
