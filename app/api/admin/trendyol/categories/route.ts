import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try { await requirePermission('stock_manage') }
  catch { return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 }) }
  const { trendyolCategoryId, categoryId } = await request.json()
  if (!Number.isInteger(trendyolCategoryId) || typeof categoryId !== 'string') return NextResponse.json({ error: 'Geçersiz kategori' }, { status: 400 })
  const [product, category] = await Promise.all([
    prisma.product.findFirst({ where: { source: 'TRENDYOL', trendyolCategoryId } }),
    prisma.category.findFirst({ where: { id: categoryId, isActive: true } })
  ])
  if (!product || !category) return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 })
  await prisma.trendyolCategoryMap.upsert({ where: { trendyolCategoryId }, create: { trendyolCategoryId, trendyolCategoryName: product.trendyolCategoryName || '', categoryId }, update: { categoryId, trendyolCategoryName: product.trendyolCategoryName || '' } })
  await prisma.product.updateMany({ where: { source: 'TRENDYOL', trendyolCategoryId }, data: { categoryId } })
  // The next sync establishes the publication status from the full Trendyol feed.
  return NextResponse.json({ success: true })
}
