import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: favId } = await params
    if (!favId) {
      console.warn('[favorites:delete] missing favId in params', params)
      return NextResponse.json({ error: 'Missing favorite id' }, { status: 400 })
    }
    const fav = await prisma.favorite.findUnique({ where: { id: favId } })
    if (!fav) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (fav.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    try {
      await prisma.favorite.delete({ where: { id: favId } })
      return NextResponse.json({ success: true })
    } catch (dbErr) {
      console.error('[favorites:delete] prisma.delete error:', dbErr)
      return NextResponse.json({ error: 'Favori silinemedi' }, { status: 500 })
    }
  } catch (error) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json({ error: 'Favori silinemedi' }, { status: 500 })
  }
}
