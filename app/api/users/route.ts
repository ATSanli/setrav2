import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrSuper } from '@/lib/permissions'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await requireAdminOrSuper()
  const body = await req.json()
  const { firstName, lastName, email, password, role } = body as { firstName?: string, lastName?: string, email: string, password: string, role?: string }

  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  const allowedRoles = ['USER', 'ADMIN', 'SUPER_ADMIN']
  const targetRole = role && allowedRoles.includes(role) ? role : 'USER'

  // Prevent non-super from creating SUPER_ADMIN
  if (targetRole === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { prisma } = await import('@/lib/prisma')
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)
  // Resolve roleId
  let roleEntry = await prisma.role.findUnique({ where: { name: targetRole } })
  if (!roleEntry) {
    roleEntry = await prisma.role.create({ data: { name: targetRole } })
  }

  const user = await prisma.user.create({ data: { firstName: firstName || '', lastName: lastName || '', email, password: hashed, role: targetRole, roleId: roleEntry.id } })

  return NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, roleId: user.roleId } })
}
