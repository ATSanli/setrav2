type Page<T> = { content: T[]; totalPages: number; totalElements?: number; nextPageToken?: string | null }
type Feed = 'approved' | 'unapproved' | 'inventory'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function safeRejectionBody(raw: string, contentType: string | null, secrets: string[]): string {
  let details: string[]
  if (contentType?.includes('html')) {
    details = ['title', 'h1'].flatMap(tag => [...raw.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))].map(match => match[1].replace(/<[^>]+>/g, ' ').trim()))
  } else {
    try {
      const body = JSON.parse(raw)
      details = body && typeof body === 'object'
        ? ['error', 'message', 'exception', 'code', 'status', 'detail'].filter(field => typeof body[field] === 'string' || typeof body[field] === 'number').map(field => `${field}: ${body[field]}`)
        : []
    } catch { details = [raw] }
  }
  let summary = details.filter(Boolean).slice(0, 3).join(' | ') || 'Yanıt gövdesi boş veya tanınmıyor'
  for (const secret of secrets) if (secret) summary = summary.replaceAll(secret, '[gizli]')
  return summary
    .replace(/(?:Basic|Bearer)\s+[A-Za-z0-9+/_=.:-]+/gi, '[gizli]')
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, '[e-posta]')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP]')
    .replace(/[A-Za-z0-9+/_=-]{40,}/g, '[gizli]')
    .slice(0, 250)
}

export function credentials() {
  const sellerId = process.env.TRENDYOL_SELLER_ID || ''
  const { TRENDYOL_API_KEY: key, TRENDYOL_API_SECRET: secret } = process.env
  if (!/^\d+$/.test(sellerId) || !key || !secret) throw new Error('Trendyol sunucu ortam değişkenleri eksik')
  return { sellerId, key, secret }
}

async function request(path: string, query?: URLSearchParams): Promise<Response> {
  const { sellerId, key, secret } = credentials()
  const url = new URL(`https://apigw.trendyol.com/integration/product/sellers/${sellerId}/${path}`)
  if (query) url.search = query.toString()
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      // Sequential calls plus this pause remain under the documented 50 requests / 10 seconds per endpoint.
      await sleep(220)
      const authorization = `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: authorization,
          'User-Agent': `${sellerId} - SelfIntegration`, Accept: 'application/json'
        }, signal: AbortSignal.timeout(12000), cache: 'no-store'
      })
      if ((response.status === 429 || response.status >= 500) && attempt < 3) {
        const seconds = Number(response.headers.get('retry-after'))
        await sleep(Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds * 1000, 10000) : 1000 * 2 ** attempt)
        continue
      }
      if (!response.ok && response.status !== 404) {
        const body = safeRejectionBody(await response.text(), response.headers.get('content-type'), [key, secret, authorization])
        throw new Error(`Trendyol HTTP ${response.status}: ${body}`)
      }
      return response
    } catch (error) {
      if (attempt === 3 || (error instanceof Error && /HTTP (400|401|403|404)/.test(error.message))) throw error
      await sleep(1000 * 2 ** attempt)
    }
  }
  throw new Error('Trendyol isteği başarısız')
}

export async function probeApprovedConnection(): Promise<{ status: 200; count: number; totalElements: number | null }> {
  const response = await request('products/approved', new URLSearchParams({ size: '1', page: '0' }))
  if (response.status !== 200) throw new Error(`Trendyol HTTP ${response.status}`)
  const data: unknown = await response.json()
  if (!data || typeof data !== 'object' || !Array.isArray((data as Page<unknown>).content)) throw new Error('Trendyol onaylı ürün yanıt biçimi hatalı')
  return { status: 200, count: (data as Page<unknown>).content.length, totalElements: Number.isInteger((data as Page<unknown>).totalElements) ? (data as Page<unknown>).totalElements! : null }
}

async function fetchPage<T>(kind: Feed, page: number, token?: string, filters?: Record<string, string>): Promise<Page<T>> {
  const params = new URLSearchParams(filters)
  params.set('size', kind === 'unapproved' ? '1000' : '100')
  if (token) params.set('nextPageToken', token)
  else params.set('page', String(page))
  const path = kind === 'inventory' ? 'products/approved/inventory-and-price' : `products/${kind}`
  const response = await request(path, params)
  if (response.status === 404) throw new Error(`Trendyol ${kind} HTTP 404`)
  const data: unknown = await response.json()
  if (!data || typeof data !== 'object' || !Array.isArray((data as Page<T>).content) || !Number.isInteger((data as Page<T>).totalPages)) throw new Error(`Trendyol ${kind} yanıt biçimi hatalı`)
  return data as Page<T>
}

export async function* scan<T>(kind: Feed, filters?: Record<string, string>): AsyncGenerator<T> {
  const size = kind === 'unapproved' ? 1000 : 100
  const boundary = 10000 / size
  let page = 0
  let token: string | undefined
  let total: number | undefined
  let visited = 0
  const usedTokens = new Set<string>()
  for (;;) {
    const result = await fetchPage<T>(kind, page, token, filters)
    total ??= result.totalElements
    for (const row of result.content) { visited++; yield row }
    if (token) {
      if (!result.nextPageToken || result.content.length === 0) break
      if (usedTokens.has(result.nextPageToken)) throw new Error('Trendyol sayfalama anahtarı tekrarlandı')
      usedTokens.add(result.nextPageToken)
      token = result.nextPageToken
    } else if (page + 1 < Math.min(result.totalPages, boundary)) {
      page++
    } else if (page + 1 >= boundary && (result.nextPageToken || result.totalPages > boundary)) {
      if (!result.nextPageToken || result.content.length === 0) throw new Error('Trendyol devam sayfası anahtarı eksik')
      token = result.nextPageToken
      usedTokens.add(token)
    } else break
  }
  if (total !== undefined && visited < total) throw new Error(`Trendyol ${kind} eksik sayfa: ${visited}/${total}`)
}

export type BasicStatus = { barcode?: string; approved?: boolean; archived?: boolean; contentId?: number }

export async function getBasicStatus(barcode: string): Promise<BasicStatus | null> {
  const response = await request(`product/${encodeURIComponent(barcode)}`)
  if (response.status === 404) return null
  const data: unknown = await response.json()
  if (!data || typeof data !== 'object' || (data as BasicStatus).barcode !== barcode || typeof (data as BasicStatus).approved !== 'boolean' || typeof (data as BasicStatus).archived !== 'boolean') throw new Error('Trendyol temel bilgi yanıt biçimi hatalı')
  return data as BasicStatus
}
