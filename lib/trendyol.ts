import 'server-only'
import { createHash, randomUUID } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

import { approvedItems, canDeactivateMissing, inventoryItems, unapprovedItem } from './trendyol-mapping'
import type { ApprovedContent, InventoryContent, InventoryItem, UnapprovedItem, Item } from './trendyol-mapping'

import { credentials, getBasicStatus, scan } from './trendyol-client'

function hash(value: string) { return createHash('sha256').update(value).digest('hex').slice(0, 24) }

export function safeTrendyolError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  if (/^(Barkod|Satıcı SKU|Aynı renk|Onaylı ürün|Onaysız ürün|Geçersiz fiyat|Fiyat aralık|Trendyol |Süre sınırı|Eşitleme zaten)/.test(message)) return message.slice(0, 300)
  if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') return 'Tekil ürün veya varyant kimliği çakıştı'
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && /^P\d{4}$/.test(error.code)) {
    const detail = message.split('\n').map(line => line.trim()).filter(Boolean).at(-1) || 'Veritabanı işlemi başarısız'
    let safe = detail.replace(/postgres(?:ql)?:\/\/\S+/gi, '[gizli veritabanı adresi]')
    for (const secret of [process.env.TRENDYOL_API_KEY, process.env.TRENDYOL_API_SECRET]) if (secret) safe = safe.replaceAll(secret, '[gizli]')
    return `Veritabanı ${error.code}: ${safe}`.slice(0, 300)
  }
  return 'Veritabanı veya eşleme hatası'
}

async function refreshProductSummary(tx: Prisma.TransactionClient, productId: string) {
  const product = await tx.product.findUniqueOrThrow({ where: { id: productId }, select: { trendyolCategoryId: true } })
  const mapping = product.trendyolCategoryId == null ? null : await tx.trendyolCategoryMap.findUnique({ where: { trendyolCategoryId: product.trendyolCategoryId } })
  const variants = await tx.productVariant.findMany({ where: { productId }, select: { remoteStock: true, salePriceCents: true, listPriceCents: true, trendyolStatus: true } })
  const visible = variants.filter(v => v.trendyolStatus === 'onSale' || (v.trendyolStatus === 'notOnSale' && v.remoteStock === 0))
  const prices = (visible.length ? visible : variants).map(v => v.salePriceCents).filter((p): p is number => p !== null)
  if (prices.length === 0) throw new Error('Trendyol ürününde geçerli fiyat yok')
  const lowestPrice = Math.min(...prices)
  const lowestVariant = variants.find(v => v.salePriceCents === lowestPrice)
  await tx.product.update({ where: { id: productId }, data: {
    price: lowestPrice / 100,
    comparePrice: lowestVariant?.listPriceCents ? lowestVariant.listPriceCents / 100 : null,
    isActive: !!mapping && visible.length > 0
  } })
}

async function saveItem(item: Item, syncedAt: Date) {
  return prisma.$transaction(async tx => {
    const mapping = await tx.trendyolCategoryMap.findUnique({ where: { trendyolCategoryId: item.categoryId } })
    const fallback = await tx.category.upsert({ where: { slug: 'trendyol-eslenmemis' }, create: { name: 'Trendyol / Eşlenmemiş', slug: 'trendyol-eslenmemis', isActive: false }, update: {} })
    let existingVariant = await tx.productVariant.findUnique({ where: { barcode: item.barcode }, include: { product: true } })
    if (!existingVariant && item.sellerSku) {
      const candidate = await tx.productVariant.findUnique({ where: { sku: item.sellerSku }, include: { product: true } })
      // Trendyol may assign the same seller stock code to multiple barcode variants.
      if (candidate && (!candidate.barcode || candidate.barcode === item.barcode)) existingVariant = candidate
    }
    if (!existingVariant) existingVariant = await tx.productVariant.findUnique({ where: { sku: item.barcode }, include: { product: true } })
    if (existingVariant?.barcode && existingVariant.barcode !== item.barcode) throw new Error('Satıcı SKU başka barkoda bağlı')
    let product = await tx.product.findUnique({ where: { trendyolMainId: item.mainId } })
    if (existingVariant && product && existingVariant.productId !== product.id) throw new Error('Barkod başka ürüne bağlı')
    if (existingVariant?.product.trendyolMainId && existingVariant.product.trendyolMainId !== item.mainId) throw new Error('Barkod farklı Trendyol ana ürününe bağlı')
    if (!product && existingVariant) product = existingVariant.product
    if (!product) product = await tx.product.findUnique({ where: { sku: item.mainId } })
    const createdProduct = !product
    const categoryId = mapping?.categoryId || fallback.id
    const productData = { name: item.name, description: item.description || null, categoryId, source: 'TRENDYOL', trendyolMainId: item.mainId, trendyolCategoryId: item.categoryId, trendyolCategoryName: item.categoryName, trendyolBrandId: item.brandId || null, trendyolBrandName: item.brandName || null, lastTrendyolSyncAt: syncedAt }
    if (!product) product = await tx.product.create({ data: { ...productData, slug: `trendyol-${hash(item.mainId)}`, sku: `TY-${hash(item.mainId)}`, price: item.salePriceCents / 100, isActive: false } })
    else product = await tx.product.update({ where: { id: product.id }, data: productData })
    const duplicate = await tx.productVariant.findFirst({ where: { productId: product.id, size: item.size, color: item.color, NOT: existingVariant ? { id: existingVariant.id } : undefined } })
    if (duplicate) throw new Error('Aynı renk/beden başka barkoda bağlı')
    const stock = item.available ? Math.max(0, item.remoteStock + (existingVariant?.localStockDelta || 0)) : 0
    const variantData = { productId: product.id, barcode: item.barcode, sellerSku: item.sellerSku || null, trendyolVariantId: item.variantId || null, trendyolContentId: item.contentId || null, trendyolStatus: item.status, size: item.size, color: item.color, remoteStock: item.remoteStock, stock, salePriceCents: item.salePriceCents, listPriceCents: item.listPriceCents, lastTrendyolSyncAt: syncedAt }
    if (existingVariant) {
      const rows = await tx.$queryRaw<{ localStockDelta: number }[]>`SELECT "localStockDelta" FROM "product_variants" WHERE "id" = ${existingVariant.id} FOR UPDATE`
      const currentDelta = rows[0]?.localStockDelta ?? 0
      await tx.productVariant.update({ where: { id: existingVariant.id }, data: { ...variantData, stock: item.available ? Math.max(0, item.remoteStock + currentDelta) : 0 } })
    }
    else await tx.productVariant.create({ data: { ...variantData, sku: item.sellerSku && !(await tx.productVariant.findUnique({ where: { sku: item.sellerSku } })) ? item.sellerSku : `TY-${hash(item.barcode)}` } })
    const existingImages = await tx.productImage.findMany({ where: { productId: product.id }, select: { url: true } })
    const urls = new Set(existingImages.map(i => i.url))
    for (const url of item.images) if (!urls.has(url)) { await tx.productImage.create({ data: { productId: product.id, url, alt: item.name, sortOrder: urls.size, source: 'TRENDYOL' } }); urls.add(url) }
    await refreshProductSummary(tx, product.id)
    return createdProduct
  }, { timeout: 20000 })
}

async function saveInventoryItem(item: InventoryItem, syncedAt: Date) {
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "product_variants" WHERE "barcode" = ${item.barcode} FOR UPDATE`
    const variant = await tx.productVariant.findUnique({ where: { barcode: item.barcode }, include: { product: true } })
    if (!variant || variant.product.source !== 'TRENDYOL') return false
    const stock = variant.trendyolStatus === 'onSale' ? Math.max(0, item.remoteStock + variant.localStockDelta) : 0
    await tx.productVariant.update({ where: { id: variant.id }, data: {
      salePriceCents: item.salePriceCents, listPriceCents: item.listPriceCents, remoteStock: item.remoteStock,
      stock, trendyolContentId: item.contentId || variant.trendyolContentId,
      trendyolVariantId: item.variantId || variant.trendyolVariantId, lastTrendyolSyncAt: syncedAt
    } })
    await refreshProductSummary(tx, variant.productId)
    return true
  }, { timeout: 20000 })
}

export async function syncTrendyol(requestedMode: 'auto' | 'full' = 'auto') {
  credentials()
  const state = await prisma.trendyolSyncState.upsert({ where: { id: 'catalog' }, create: { id: 'catalog' }, update: {} })
  const full = requestedMode === 'full' || !state.lastFullSuccessAt || Date.now() - state.lastFullSuccessAt.getTime() >= 7 * 86400000
  const token = randomUUID()
  const lock = await prisma.trendyolSyncState.updateMany({ where: { id: 'catalog', OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }] }, data: { lockToken: token, lockedUntil: new Date(Date.now() + 310000) } })
  if (!lock.count) throw new Error('Eşitleme zaten çalışıyor')
  let run: { id: string }
  try { run = await prisma.trendyolSyncRun.create({ data: { mode: full ? 'FULL' : 'INCREMENTAL' } }) }
  catch (error) {
    await prisma.trendyolSyncState.updateMany({ where: { id: 'catalog', lockToken: token }, data: { lockToken: null, lockedUntil: null } })
    throw error
  }
  const started = Date.now()
  const syncedAt = new Date()
  const seen = new Set<string>()
  const processedProducts = new Set<string>()
  const createdProducts = new Set<string>()
  const updatedProducts = new Set<string>()
  const failedProducts = new Set<string>()
  const seenImages = new Map<string, Set<string>>()
  let processed = 0, created = 0, updated = 0, failed = 0, deactivated = 0
  let scanComplete = false
  const ensureTime = () => { if (Date.now() - started > 255000) throw new Error('Süre sınırı; tam tarama tamamlanamadı') }
  const countFailure = (key?: string) => {
    const id = key || randomUUID()
    if (!failedProducts.has(id)) { failedProducts.add(id); failed++ }
  }
  const issue = async (barcode: string | undefined, error: unknown, key?: string) => {
    countFailure(key || barcode)
    await prisma.trendyolSyncIssue.create({ data: { runId: run.id, barcode, reason: safeTrendyolError(error) } })
  }
  const countProduct = (mainId: string) => {
    if (!processedProducts.has(mainId)) { processedProducts.add(mainId); processed++ }
  }
  const handle = async (item: Item) => {
    ensureTime()
    countProduct(item.mainId)
    seen.add(item.barcode)
    try {
      if (await saveItem(item, syncedAt)) { if (!createdProducts.has(item.mainId)) { createdProducts.add(item.mainId); created++ } }
      else if (!createdProducts.has(item.mainId) && !updatedProducts.has(item.mainId)) { updatedProducts.add(item.mainId); updated++ }
      const images = seenImages.get(item.mainId) || new Set<string>()
      item.images.forEach(url => images.add(url))
      seenImages.set(item.mainId, images)
    } catch (error) { await issue(item.barcode, error, item.mainId) }
  }
  const scanApproved = async (filters?: Record<string, string>) => {
    for await (const content of scan<ApprovedContent>('approved', filters)) {
      ensureTime()
      try { for (const item of approvedItems(content)) await handle(item) }
      catch (error) { await issue(content.variants?.[0]?.barcode, error, content.productMainId) }
    }
  }
  try {
    if (full) {
      await scanApproved()
      for await (const row of scan<UnapprovedItem>('unapproved')) {
        ensureTime()
        try { if (!row.barcode || !seen.has(row.barcode)) await handle(unapprovedItem(row)) }
        catch (error) { await issue(row.barcode, error, row.productMainId) }
      }
    } else {
      const startDate = String((state.lastSuccessAt || state.lastFullSuccessAt!).getTime() - 86400000)
      for (const dateQueryType of ['CONTENT_MODIFIED_DATE', 'VARIANT_MODIFIED_DATE', 'VARIANT_CREATED_DATE']) {
        await scanApproved({ startDate, dateQueryType })
      }
    }
    // The complete approved V2 feed already carries each variant's current price and stock.
    // The separate inventory feed is needed for runs between full catalog scans.
    if (!full) for await (const content of scan<InventoryContent>('inventory')) {
      ensureTime()
      try {
        for (const item of inventoryItems(content)) {
          ensureTime()
          try {
            const existing = await prisma.productVariant.findUnique({ where: { barcode: item.barcode }, select: { trendyolStatus: true, product: { select: { source: true, trendyolMainId: true } } } })
            if (!existing || (item.remoteStock > 0 && existing.trendyolStatus !== 'onSale')) await scanApproved({ barcode: item.barcode })
            if (!await saveInventoryItem(item, syncedAt)) throw new Error('Trendyol stok/fiyat barkodu katalogda bulunamadı')
            const mainId = content.productMainId || existing?.product.trendyolMainId || item.barcode
            countProduct(mainId)
            if (!createdProducts.has(mainId) && !updatedProducts.has(mainId)) { updatedProducts.add(mainId); updated++ }
          } catch (error) { await issue(item.barcode, error, content.productMainId) }
        }
      } catch (error) { await issue(content.variants?.[0]?.barcode, error, content.productMainId) }
    }
    scanComplete = true
    if (full && seen.size === 0 && await prisma.product.count({ where: { source: 'TRENDYOL' } }) > 0) throw new Error('Trendyol tam taraması boş; pasifleştirme durduruldu')
    if (full && failed === 0) {
      const missing = await prisma.productVariant.findMany({ where: { product: { source: 'TRENDYOL' }, barcode: { not: null }, trendyolStatus: { not: 'missing' }, lastTrendyolSyncAt: { lt: syncedAt } }, select: { barcode: true } })
      for (const variant of missing) {
        ensureTime()
        try {
          const status = await getBasicStatus(variant.barcode!)
          if (!canDeactivateMissing(status)) throw new Error('Trendyol onaylı barkod tam listede bulunamadı; pasifleştirme ertelendi')
        } catch (error) { await issue(variant.barcode!, error) }
      }
      if (failed === 0) {
        for (const [mainId, images] of seenImages) {
          const product = await prisma.product.findUnique({ where: { trendyolMainId: mainId }, select: { id: true } })
          if (product) await prisma.productImage.deleteMany({ where: { productId: product.id, source: 'TRENDYOL', url: { notIn: [...images] } } })
        }
        const changed = await prisma.productVariant.updateMany({ where: { product: { source: 'TRENDYOL' }, barcode: { not: null }, trendyolStatus: { not: 'missing' }, lastTrendyolSyncAt: { lt: syncedAt } }, data: { stock: 0, trendyolStatus: 'missing' } })
        deactivated = changed.count
        const products = await prisma.product.findMany({ where: { source: 'TRENDYOL' }, include: { variants: { select: { trendyolStatus: true, remoteStock: true } } } })
        for (const product of products) if (!product.variants.some(v => v.trendyolStatus === 'onSale' || (v.trendyolStatus === 'notOnSale' && v.remoteStock === 0))) await prisma.product.update({ where: { id: product.id }, data: { isActive: false } })
        await prisma.trendyolSyncState.update({ where: { id: 'catalog' }, data: { lastFullSuccessAt: new Date() } })
      }
    }
    if (failed === 0) await prisma.trendyolSyncState.update({ where: { id: 'catalog' }, data: { lastSuccessAt: new Date() } })
    return await prisma.trendyolSyncRun.update({ where: { id: run.id }, data: { finishedAt: new Date(), status: failed ? 'PARTIAL' : 'SUCCESS', processed, created, updated, failed, deactivated } })
  } catch (error) {
    const message = safeTrendyolError(error)
    await prisma.trendyolSyncRun.update({ where: { id: run.id }, data: { finishedAt: new Date(), status: scanComplete ? 'PARTIAL' : 'FAILED', processed, created, updated, failed, deactivated, error: message.slice(0, 500) } })
    throw error
  } finally {
    await prisma.trendyolSyncState.updateMany({ where: { id: 'catalog', lockToken: token }, data: { lockToken: null, lockedUntil: null } })
  }
}
