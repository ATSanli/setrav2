import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrSuper } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import { adminApiAccess } from '@/lib/admin-api-auth'
import type { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { denied } = await adminApiAccess()
  if (denied) return denied
  const search = req.nextUrl.searchParams.get('q')?.trim() || ''
  const page = Math.max(1, Math.floor(Number(req.nextUrl.searchParams.get('page')) || 1))
  const pageSize = Math.min(100, Math.max(1, Math.floor(Number(req.nextUrl.searchParams.get('pageSize')) || 20)))
  const where: Prisma.UserWhereInput = {
    ...(req.nextUrl.searchParams.get('role') === 'USER' ? { role: 'USER' } : {}),
    ...(search ? { OR: [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } }
    ] } : {})
  }
  try {
    const { prisma } = await import('@/lib/prisma')
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true, updatedAt: true },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.user.count({ where })
    ])
    return NextResponse.json({ users, total, page, pageSize })
  } catch (error) {
    console.error('Admin user list failed:', error)
    return NextResponse.json({ error: 'Kullanıcı listesi yüklenemedi' }, { status: 503 })
  }
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
