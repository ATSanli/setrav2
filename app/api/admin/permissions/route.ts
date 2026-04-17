import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/permissions'

export async function GET() {
  try {
    await requireSuperAdmin()
    // ensure default permission set exists
    const defaults = [
      'product_create', 'product_edit', 'product_delete',
      'order_manage', 'stock_manage',
      'user_view', 'user_edit', 'role_assign'
    ]
    for (const name of defaults) {
      await prisma.permission.upsert({ where: { name }, update: {}, create: { name } })
    }
    const permissions = await prisma.permission.findMany({ orderBy: { name: 'asc' } })
    const names = (permissions || []).map(p => p.name)
    return NextResponse.json({ permissions: names })
  } catch (err) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
}
