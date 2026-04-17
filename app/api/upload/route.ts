import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products')
try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }) } catch (e) { /* ignore */ }

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const entries = formData.getAll('files')
    if (!entries || entries.length === 0) return NextResponse.json({ paths: [] })

    const saved: string[] = []
    for (const item of entries) {
      // Web File object
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const file = item as File
      if (!file || typeof file.arrayBuffer !== 'function') continue
      const mime = file.type || ''
      if (!ALLOWED.includes(mime)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
      const buf = Buffer.from(await file.arrayBuffer())
      if (buf.length > MAX_BYTES) return NextResponse.json({ error: 'File too large' }, { status: 400 })

      const ext = mime === 'image/png' ? '.png' : mime === 'image/webp' ? '.webp' : '.jpg'
      const filename = `${uuidv4()}${ext}`
      const filePath = path.join(UPLOAD_DIR, filename)
      await fs.promises.writeFile(filePath, buf)
      const publicPath = `/uploads/products/${filename}`
      saved.push(publicPath)
    }

    return NextResponse.json({ paths: saved })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const p = body.path || body.file || ''
    if (!p || typeof p !== 'string') return NextResponse.json({ error: 'Missing path' }, { status: 400 })
    // normalize
    if (!p.startsWith('/uploads/products/')) return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    const filename = p.replace('/uploads/products/', '')
    const filePath = path.join(UPLOAD_DIR, filename)
    try { await fs.promises.unlink(filePath) } catch (e) { /* ignore not found */ }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Delete failed' }, { status: 500 })
  }
}
