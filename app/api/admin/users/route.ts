import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrSuper } from '@/lib/permissions'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  await requireAdminOrSuper()
  const { prisma } = await import('@/lib/prisma')
  const users = await prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true, updatedAt: true } , orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  // Create user: ADMIN or SUPER_ADMIN can create, but only SUPER_ADMIN can assign SUPER_ADMIN role
  const session = await requireAdminOrSuper()
  const body = await req.json()
  const { firstName, lastName, email, password, role } = body as { firstName?: string, lastName?: string, email: string, password: string, role?: string }
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  if (role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { prisma } = await import('@/lib/prisma')
  const hashed = await bcrypt.hash(password, 10)
  // Find role entry
  const roleEntry = await prisma.role.findUnique({ where: { name: role || 'USER' } })
  const user = await prisma.user.create({ data: { firstName: firstName || '', lastName: lastName || '', email, password: hashed, role: role || 'USER', roleId: roleEntry ? roleEntry.id : undefined } })
  return NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } })
}
