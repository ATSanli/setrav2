import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export const runtime = 'nodejs'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

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

    const fileList: any[] = []

    if ((!entries || entries.length === 0) && formData.has('file')) {
      const f = formData.get('file')
      if (f) fileList.push(f)
    } else {
      fileList.push(...entries)
    }

    if (fileList.length === 0) {
      return NextResponse.json({ paths: [] })
    }

    const saved: any[] = []

    for (const item of fileList) {
      const file = item as File
      if (!file || typeof file.arrayBuffer !== 'function') continue

      const mime = file.type
      if (!ALLOWED.includes(mime)) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
      }

      const buf = Buffer.from(await file.arrayBuffer())

      if (buf.length > MAX_BYTES) {
        return NextResponse.json({ error: 'File too large' }, { status: 400 })
      }

      const result = await uploadBufferToCloudinary(buf)

      saved.push({
        url: result.secure_url,
        public_id: result.public_id,
      })
    }

    return NextResponse.json({ paths: saved })
  } catch (err: any) {
    console.log("UPLOAD ERROR:", err)
    return NextResponse.json(
      { error: err.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { path, public_id, file } = body as any

    if (!public_id && !path && !file) {
      return NextResponse.json({ error: 'Missing path or public_id' }, { status: 400 })
    }

    let id = public_id || file || ''

    if (!id && path && typeof path === 'string') {
      // Try to derive public_id from Cloudinary secure_url
      // Example: https://res.cloudinary.com/<cloud>/image/upload/v168/.../setra/products/abcd.jpg
      const parts = path.split('/upload/')
      if (parts.length > 1) {
        id = parts[1]
        // remove version segment like v12345/
        id = id.replace(/^v\d+\//, '')
        // remove file extension
        id = id.replace(/\.[a-zA-Z0-9]+$/, '')
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Unable to determine public_id' }, { status: 400 })
    }

    await cloudinary.uploader.destroy(id, { resource_type: 'image' })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE /api/upload error:', err)
    return NextResponse.json({ error: err?.message || 'Delete failed' }, { status: 500 })
  }
}