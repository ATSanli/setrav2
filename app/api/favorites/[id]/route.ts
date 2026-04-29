import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const favId = params.id
    const fav = await prisma.favorite.findUnique({ where: { id: favId } })
    if (!fav) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (fav.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.favorite.delete({ where: { id: favId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Favorites DELETE error:', error)
    const message = (error as any)?.message || String(error) || 'Failed to delete favorite'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
