import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/permissions'

export async function GET(_request: Request, { params }: { params: any }) {
  try {
    // In local development allow access to ease testing
    if (process.env.NODE_ENV !== 'development') {
      await requireSuperAdmin()
    }
    const { userId } = await params
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { permissions: true } })
    const names = user && user.permissions ? JSON.parse(user.permissions) : []
    return NextResponse.json({ permissions: names })
  } catch (err) {
    // debug log
    // eslint-disable-next-line no-console
    console.error('GET /api/admin/permissions/[userId] error:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
}

export async function PATCH(request: Request, { params }: { params: any }) {
  try {
    // In local development allow access to ease testing
    if (process.env.NODE_ENV !== 'development') {
      await requireSuperAdmin()
    }
    const { userId } = await params
    const body = await request.json()
    const { permissions } = body
    if (!Array.isArray(permissions)) return NextResponse.json({ error: 'permissions array required' }, { status: 400 })

    // Validate permissions is array of strings
    for (const perm of permissions) if (typeof perm !== 'string') return NextResponse.json({ error: 'permissions must be strings' }, { status: 400 })

    // Optionally upsert into permissions table for canonical list
    for (const name of permissions) {
      await prisma.permission.upsert({ where: { name }, update: {}, create: { name } })
    }

    // Save as JSON string on user.permissions
    await prisma.user.update({ where: { id: userId }, data: { permissions: JSON.stringify(permissions) } })

    return NextResponse.json({ success: true })
  } catch (err) {
    // debug log
    // eslint-disable-next-line no-console
    console.error('PATCH /api/admin/permissions/[userId] error:', err)
    return NextResponse.json({ error: (err as Error).message || 'Failed' }, { status: 500 })
  }
}
