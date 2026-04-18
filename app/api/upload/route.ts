import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export const runtime = 'nodejs'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

async function uploadBufferToCloudinary(buffer: Buffer) {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'setra/products', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    stream.end(buffer)
  })
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const entries = formData.getAll('files')
    // also accept single `file` field
    if ((!entries || entries.length === 0) && formData.has('file')) {
      const f = formData.get('file')
      if (f) entries.push(f)
    }
    if (!entries || entries.length === 0) return NextResponse.json({ paths: [] })

    const saved: Array<{ url: string; public_id: string }> = []
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

      const result = await uploadBufferToCloudinary(buf)
      saved.push({ url: result.secure_url, public_id: result.public_id })
    }

    return NextResponse.json({ paths: saved })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const publicId = body.public_id || body.publicId || body.id || ''
    const url = body.url || body.path || ''

    let targetPublicId = publicId
    if (!targetPublicId && url && typeof url === 'string') {
      // try to extract public_id from a Cloudinary URL if possible
      // Cloudinary URLs often end with /v{version}/{folder}/{public_id}.{ext}
      const parts = url.split('/')
      const last = parts[parts.length - 1] || ''
      targetPublicId = last.split('.').slice(0, -1).join('.')
    }

    if (!targetPublicId) return NextResponse.json({ error: 'Missing public_id or url' }, { status: 400 })

    const result = await cloudinary.uploader.destroy(targetPublicId, { resource_type: 'image' })
    return NextResponse.json({ success: true, result })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Delete failed' }, { status: 500 })
  }
}
