import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrSuper } from '@/lib/permissions'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminOrSuper()
  const { prisma } = await import('@/lib/prisma')
  const user = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, email: true, firstName: true, lastName: true, role: true, roleId: true, createdAt: true } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminOrSuper()
  const { prisma } = await import('@/lib/prisma')
  const body = await req.json()
  const { firstName, lastName, email, password, role } = body as any
  // Prevent non-SUPER_ADMIN from assigning SUPER_ADMIN role
  if (role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const data: any = { firstName, lastName, email }
  if (password) data.password = await bcrypt.hash(password, 10)
  if (role) {
    const roleEntry = await prisma.role.findUnique({ where: { name: role } })
    if (roleEntry) {
      data.role = role
      data.roleId = roleEntry.id
    }
  }
  const user = await prisma.user.update({ where: { id: params.id }, data })
  return NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminOrSuper()
  // Prevent deleting SUPER_ADMIN by non-super
  const { prisma } = await import('@/lib/prisma')
  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (target.role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

