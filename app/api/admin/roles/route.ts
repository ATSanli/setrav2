import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/permissions'

const ALLOWED_PERMISSIONS = [
  'admin_panel_access',
  'dashboard_view',
  'product_create',
  'product_edit',
  'product_delete',
  'order_manage',
  'stock_manage',
  'user_manage',
  'role_manage',
  'permission_manage',
  'browse_products',
  'place_orders',
  'view_own_orders'
]

export async function GET() {
  const { prisma } = await import('@/lib/prisma')
  // Ensure default roles exist
  const defaultRoles = ['USER', 'ADMIN', 'SUPER_ADMIN']
  for (const name of defaultRoles) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } })
  }
  const roles = await prisma.role.findMany({ include: { permissions: true } })
  return NextResponse.json({ roles: roles.map(r => ({ id: r.id, name: r.name, permissions: r.permissions.map((p: any) => p.permission) })) })
}

export async function POST(req: NextRequest) {
  await requireSuperAdmin()
  const body = await req.json()
  const { roleId, permissions } = body as { roleId: string, permissions: string[] }
  if (!roleId || !Array.isArray(permissions)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  // Validate permissions
  const invalid = permissions.filter(p => !ALLOWED_PERMISSIONS.includes(p))
  if (invalid.length) return NextResponse.json({ error: 'Invalid permissions', invalid }, { status: 400 })

  const { prisma } = await import('@/lib/prisma')
  // Remove existing role permissions
  await prisma.rolePermission.deleteMany({ where: { roleId } })

  // Create new role permissions
  const createData = permissions.map(p => ({ roleId, permission: p }))
  if (createData.length) {
    // Some Prisma clients/environments may not support createMany for this model; use transaction create instead
    await prisma.$transaction(createData.map(d => prisma.rolePermission.create({ data: d })))
  }

  return NextResponse.json({ ok: true })
}
