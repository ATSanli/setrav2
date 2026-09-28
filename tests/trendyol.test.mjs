import test from 'node:test'
import assert from 'node:assert/strict'
import { approvedItems, canDeactivateMissing, inventoryItems, unapprovedItem, moneyToCents } from '../lib/trendyol-mapping.ts'
import { getBasicStatus, probeApprovedConnection, scan } from '../lib/trendyol-client.ts'

test('V2 content variants use barcodes, color, size and exact cents', () => {
  const items = approvedItems({ productMainId: 'MODEL-1', contentId: 42, title: 'Elbise', category: { id: 12, name: 'Elbise' }, images: [{ url: '/mediacenter/1.jpg' }], attributes: [{ attributeName: 'Renk', attributeValue: 'Mavi' }], variants: [
    { variantId: 1, barcode: 'B-S', stockCode: 'SKU-S', onSale: true, stock: { quantity: 2 }, price: { salePrice: 129.99, listPrice: 199.99 }, attributes: [{ attributeName: 'Beden', attributeValue: 'S' }] },
    { variantId: 2, barcode: 'B-M', onSale: true, stock: { quantity: 0 }, price: { salePrice: 139.5 }, attributes: [{ attributeName: 'Beden', attributeValue: 'M' }] }
  ] })
  assert.equal(items[0].mainId, items[1].mainId)
  assert.equal(items[0].barcode, 'B-S')
  assert.equal(items[0].color, 'Mavi')
  assert.equal(items[0].size, 'S')
  assert.equal(items[0].salePriceCents, 12999)
  assert.equal(items[0].listPriceCents, 19999)
  assert.equal(items[0].images[0], 'https://cdn.dsmcdn.com/mediacenter/1.jpg')
  assert.equal(items[1].remoteStock, 0)
  assert.equal(items[1].salePriceCents, 13950)
})

test('unapproved variants are never published and bad prices fail closed', () => {
  const item = unapprovedItem({ productMainId: 'MODEL-1', barcode: 'DRAFT', title: 'Taslak', category: { id: 12 }, quantity: 4, salePrice: 89.01, status: 'pendingApproval' })
  assert.equal(item.available, false)
  assert.equal(item.salePriceCents, 8901)
  assert.throws(() => moneyToCents('1.999'))
  assert.throws(() => approvedItems({ productMainId: 'X', title: 'X', category: { id: 1 }, variants: [{ barcode: 'B', price: { salePrice: 12 } }] }))
})

test('V2 pagination visits every numbered page', async () => {
  process.env.TRENDYOL_SELLER_ID = '123'
  process.env.TRENDYOL_API_KEY = 'test-key'
  process.env.TRENDYOL_API_SECRET = 'test-secret'
  const originalFetch = globalThis.fetch
  const pages = []
  globalThis.fetch = async (url, options) => {
    const page = Number(new URL(url).searchParams.get('page'))
    assert.equal(new URL(url).origin, 'https://apigw.trendyol.com')
    assert.match(url.toString(), /\/integration\/product\/sellers\/123\/products\/approved/)
    assert.equal(options.method, 'GET')
    assert.equal(options.headers['User-Agent'], '123 - SelfIntegration')
    assert.equal(options.headers.Authorization, `Basic ${Buffer.from('test-key:test-secret').toString('base64')}`)
    pages.push(page)
    return new Response(JSON.stringify({ content: [page], totalPages: 3 }), { status: 200 })
  }
  try {
    const rows = []
    for await (const row of scan('approved')) rows.push(row)
    assert.deepEqual(rows, [0, 1, 2])
    assert.deepEqual(pages, [0, 1, 2])
  } finally { globalThis.fetch = originalFetch }
})

test('403 records a safe response summary without credentials', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('<html><title>Attention Required! | Cloudflare</title><h1>Sorry, you have been blocked</h1></html>', { status: 403, headers: { 'content-type': 'text/html' } })
  try {
    await assert.rejects(probeApprovedConnection(), error => {
      assert.match(error.message, /Trendyol HTTP 403: Attention Required! \| Cloudflare \| Sorry, you have been blocked/)
      assert.doesNotMatch(error.message, /test-key|test-secret|Basic /)
      return true
    })
  } finally { globalThis.fetch = originalFetch }
})

test('failed V2 page throws instead of presenting a complete scan', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('{}', { status: 401 })
  try {
    await assert.rejects(async () => { for await (const row of scan('approved')) void row }, /HTTP 401/)
  } finally { globalThis.fetch = originalFetch }
})

test('inventory V2 maps seller prices and stock by barcode', () => {
  const [item] = inventoryItems({ contentId: 81, variants: [{ variantId: 9, barcode: 'BAR-9', salePrice: 699.99, listPrice: 799.5, quantity: 0, priceSeenByCustomer: 499 }] })
  assert.deepEqual(item, { barcode: 'BAR-9', contentId: '81', variantId: '9', salePriceCents: 69999, listPriceCents: 79950, remoteStock: 0 })
  assert.throws(() => inventoryItems({ variants: [{ barcode: 'BAD', salePrice: 10 }] }), /stok\/fiyat alanları/)
})

test('inventory endpoint paginates and missing pages fail closed', async () => {
  const originalFetch = globalThis.fetch
  const pages = []
  globalThis.fetch = async url => {
    const request = new URL(url)
    assert.match(request.pathname, /\/products\/approved\/inventory-and-price$/)
    pages.push(Number(request.searchParams.get('page')))
    return new Response(JSON.stringify({ content: [pages.length], totalPages: 2, totalElements: 2 }), { status: 200 })
  }
  try {
    const rows = []
    for await (const row of scan('inventory')) rows.push(row)
    assert.deepEqual(rows, [1, 2])
    assert.deepEqual(pages, [0, 1])
  } finally { globalThis.fetch = originalFetch }
  globalThis.fetch = async () => new Response(JSON.stringify({ content: [], totalPages: 1, totalElements: 1 }), { status: 200 })
  try { await assert.rejects(async () => { for await (const row of scan('inventory')) void row }, /eksik sayfa/) }
  finally { globalThis.fetch = originalFetch }
})

test('single barcode status is used only as a safe read check', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async url => {
    assert.match(new URL(url).pathname, /\/product\/B-1$/)
    return new Response(JSON.stringify({ barcode: 'B-1', approved: true, archived: false, contentId: 4 }), { status: 200 })
  }
  try { assert.deepEqual(await getBasicStatus('B-1'), { barcode: 'B-1', approved: true, archived: false, contentId: 4 }) }
  finally { globalThis.fetch = originalFetch }
})

test('missing variants stay published when basic status remains approved', () => {
  assert.equal(canDeactivateMissing({ approved: true, archived: false }), false)
  assert.equal(canDeactivateMissing({ approved: false, archived: false }), true)
  assert.equal(canDeactivateMissing({ approved: true, archived: true }), true)
  assert.equal(canDeactivateMissing(null), true)
})
