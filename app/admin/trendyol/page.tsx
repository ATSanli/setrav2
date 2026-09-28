import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import { SyncButton, CategoryMapping } from './trendyol-actions'

export const dynamic = 'force-dynamic'

export default async function TrendyolPage() {
  await requirePermission('stock_manage')
  const [state, runs, categories, unmapped, mappings] = await Promise.all([
    prisma.trendyolSyncState.findUnique({ where: { id: 'catalog' } }),
    prisma.trendyolSyncRun.findMany({ orderBy: { startedAt: 'desc' }, take: 5, include: { issues: { take: 100 } } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.product.findMany({ where: { source: 'TRENDYOL', trendyolCategoryId: { not: null } }, select: { trendyolCategoryId: true, trendyolCategoryName: true, name: true }, distinct: ['trendyolCategoryId'] }),
    prisma.trendyolCategoryMap.findMany({ select: { trendyolCategoryId: true } })
  ])
  const mapped = new Set(mappings.map(m => m.trendyolCategoryId))
  return <div className="space-y-8">
    <div className="flex items-center justify-between"><div><h1 className="text-3xl font-serif">Trendyol eşitleme</h1><p>Yalnızca Trendyol → SETRA ürün, fiyat ve stok okuma</p></div><SyncButton /></div>
    <section className="rounded border p-5 space-y-2">
      <h2 className="text-xl font-medium">Durum</h2>
      <p>Son başarılı eşitleme: {state?.lastSuccessAt ? state.lastSuccessAt.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }) : 'Henüz yok'}</p>
      <p>Son tam tarama: {state?.lastFullSuccessAt ? state.lastFullSuccessAt.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }) : 'Henüz yok'}</p>
      {runs.map(run => <div key={run.id} className="border-t pt-3">
        <p>{run.startedAt.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })} · {run.mode} · {run.status} · İşlenen {run.processed} · Eklenen {run.created} · Güncellenen {run.updated} · Pasifleştirilen varyant {run.deactivated} · Hatalı {run.failed}</p>
        {run.error && <p className="text-red-700">{run.error}</p>}
        {run.issues.map(issue => <p key={issue.id} className="text-sm text-red-700">{issue.barcode || 'Ürün'}: {issue.reason}</p>)}
      </div>)}
    </section>
    <section className="rounded border p-5 space-y-3">
      <h2 className="text-xl font-medium">Eşlenmeyen kategoriler</h2>
      <p>Bu ürünler eşleme yapılıp yeniden eşitlenene kadar sitede yayınlanmaz.</p>
      {unmapped.filter(p => !mapped.has(p.trendyolCategoryId!)).map(p => <CategoryMapping key={p.trendyolCategoryId} id={p.trendyolCategoryId!} name={p.trendyolCategoryName || p.name} categories={categories} />)}
    </section>
    <p className="text-sm">Trendyol kaynaklı ürünler sitede görünür, fakat SETRA üzerinden siparişleri kapalıdır. Trendyol'a stok yazmadan iki kanalda aynı fiziksel stoğu güvenle satmak mümkün değildir; ayrı kanal stoğu veya çift yönlü stok yönetimi kurulana kadar bu güvenli varsayılan geçerlidir.</p>
  </div>
}
