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