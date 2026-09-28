type Attr = { attributeName?: string; attributeValue?: string }
type ApprovedVariant = { variantId?: number; barcode?: string; stockCode?: string; attributes?: Attr[]; onSale?: boolean; archived?: boolean; blacklisted?: boolean; locked?: boolean; stock?: { quantity?: number }; price?: { salePrice?: number; listPrice?: number } }
export type ApprovedContent = { contentId?: number; productMainId?: string; title?: string; description?: string; brand?: { id?: number; name?: string }; category?: { id?: number; name?: string }; images?: { url?: string }[]; attributes?: Attr[]; variants?: ApprovedVariant[] }
export type UnapprovedItem = { productMainId?: string; barcode?: string; stockCode?: string; title?: string; description?: string; category?: { id?: number; name?: string }; media?: { url?: string }[]; attributes?: Attr[]; status?: string; quantity?: number; salePrice?: number; listPrice?: number }
export type InventoryContent = { contentId?: number; productMainId?: string; variants?: { variantId?: number; barcode?: string; salePrice?: number; listPrice?: number; quantity?: number }[] }
export type InventoryItem = { barcode: string; contentId?: string; variantId?: string; salePriceCents: number; listPriceCents: number | null; remoteStock: number }
type Page<T> = { content: T[]; totalPages: number; nextPageToken?: string | null }
export type Item = { mainId: string; barcode: string; sellerSku?: string; contentId?: string; variantId?: string; name: string; description?: string; brandId?: number; brandName?: string; categoryId: number; categoryName: string; images: string[]; color: string; size: string; salePriceCents: number; listPriceCents: number | null; remoteStock: number; status: string; available: boolean }

export function moneyToCents(value: unknown): number {
  const raw = String(value)
  if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(raw)) throw new Error('Geçersiz fiyat')
  const [whole, fraction = ''] = raw.split('.')
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  if (!Number.isSafeInteger(cents)) throw new Error('Fiyat aralık dışında')
  return cents
}

function attr(attrs: Attr[] | undefined, names: string[], fallback: string): string {
  return attrs?.find(a => names.some(n => n.toLocaleLowerCase('tr') === a.attributeName?.toLocaleLowerCase('tr')))?.attributeValue?.trim() || fallback
}

function imageUrls(images: { url?: string }[] | undefined): string[] {
  return [...new Set((images || []).map(i => {
    if (i.url?.startsWith('/mediacenter')) return `https://cdn.dsmcdn.com${i.url}`
    return i.url
  }).filter((url): url is string => !!url && /^https:\/\//.test(url)))].slice(0, 24)
}

function plainDescription(value?: string): string | undefined {
  return value?.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/(p|div|li)>|<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .trim()
}

export function approvedItems(content: ApprovedContent): Item[] {
  if (!content.productMainId || !content.category?.id || !content.title || !Array.isArray(content.variants)) throw new Error('Onaylı ürün alanları eksik')
  return content.variants.map(v => {
    if (!v.barcode || v.price?.salePrice == null || !Number.isInteger(v.stock?.quantity) || (v.stock?.quantity ?? 0) < 0) throw new Error('Barkod, fiyat veya stok eksik')
    const status = v.archived ? 'archived' : v.blacklisted ? 'blacklisted' : v.locked ? 'locked' : v.onSale ? 'onSale' : 'notOnSale'
    return {
      mainId: content.productMainId!, barcode: v.barcode, sellerSku: v.stockCode,
      contentId: content.contentId?.toString(), variantId: v.variantId?.toString(), name: content.title!,
      description: plainDescription(content.description), brandId: content.brand?.id, brandName: content.brand?.name, categoryId: content.category!.id!, categoryName: content.category!.name || '',
      images: imageUrls(content.images), color: attr(content.attributes, ['Renk', 'Web Color'], 'Standart'),
      size: attr(v.attributes, ['Beden'], 'Standart'), salePriceCents: moneyToCents(v.price.salePrice),
      listPriceCents: v.price.listPrice == null ? null : moneyToCents(v.price.listPrice),
      remoteStock: v.stock!.quantity!, status, available: status === 'onSale'
    }
  })
}

export function inventoryItems(content: InventoryContent): InventoryItem[] {
  if (!Array.isArray(content.variants)) throw new Error('Trendyol stok/fiyat varyantları eksik')
  return content.variants.map(variant => {
    if (!variant.barcode || variant.salePrice == null || !Number.isInteger(variant.quantity) || variant.quantity! < 0) throw new Error('Trendyol stok/fiyat alanları eksik')
    return {
      barcode: variant.barcode, contentId: content.contentId?.toString(), variantId: variant.variantId?.toString(),
      salePriceCents: moneyToCents(variant.salePrice),
      listPriceCents: variant.listPrice == null ? null : moneyToCents(variant.listPrice),
      remoteStock: variant.quantity!
    }
  })
}

export function canDeactivateMissing(status: { approved?: boolean; archived?: boolean } | null): boolean {
  return status === null || status.approved === false || status.archived === true
}

export function unapprovedItem(row: UnapprovedItem): Item {
  if (!row.productMainId || !row.barcode || !row.category?.id || !row.title || row.salePrice == null || !Number.isInteger(row.quantity) || (row.quantity ?? 0) < 0) throw new Error('Onaysız ürün alanları eksik')
  return {
    mainId: row.productMainId, barcode: row.barcode, sellerSku: row.stockCode, name: row.title,
    description: plainDescription(row.description), categoryId: row.category.id, categoryName: row.category.name || '',
    images: imageUrls(row.media), color: attr(row.attributes, ['Renk', 'Web Color'], 'Standart'),
    size: attr(row.attributes, ['Beden'], 'Standart'), salePriceCents: moneyToCents(row.salePrice),
    listPriceCents: row.listPrice == null ? null : moneyToCents(row.listPrice),
    remoteStock: row.quantity!, status: row.status || 'pendingApproval', available: false
  }
}

