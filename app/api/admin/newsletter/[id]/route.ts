import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest, { params }: { params: { id?: string } }) {
  try {
    console.log('Admin newsletter DELETE request url=', request.url, 'params=', params)

    // Prefer params.id (app router), but fall back to parsing the URL path
    let id = params?.id
    if (!id) {
      try {
        const url = new URL(request.url)
        const parts = url.pathname.split('/').filter(Boolean)
        id = parts[parts.length - 1]
      } catch (err) {
        // ignore URL parse errors
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id parameter in path' }, { status: 400 })
    }

    try {
      // ID is expected to be a string (cuid/uuid). Do not cast to number.
      await prisma.newsletterSubscriber.delete({ where: { id } })
      return NextResponse.json({ success: true })
    } catch (e: any) {
      const code = e?.code
      if (code === 'P2025') {
        return NextResponse.json({ success: false, error: 'Subscriber not found' }, { status: 404 })
      }
      console.error('Admin newsletter delete prisma error:', e)
      return NextResponse.json({ success: false, error: 'Delete failed', details: e?.message }, { status: 500 })
    }
  } catch (error) {
    console.error('Admin newsletter delete error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
