import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { NextRequest } from 'next/server'

export async function requireSuperAdmin(req?: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireAdminOrSuper(req?: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN')) {
    throw new Error('Unauthorized')
  }
  return session
}

// Require a specific permission (SUPER_ADMIN bypasses)
export async function requirePermission(permissionName: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')
  if (session.user.role === 'SUPER_ADMIN') return session
  // Prefer session.permissions (populated at login from role), but validate against Role table server-side.
  const sessionPerms = (session.user as any).permissions as string[] | undefined
  if (sessionPerms && Array.isArray(sessionPerms) && sessionPerms.includes(permissionName)) return session

  const { prisma } = await import('./prisma')
  // Try resolve role by roleId from session if present, otherwise by role name
  const roleId = (session.user as any).roleId as string | undefined
  let role: any = null
  try {
    if (roleId) {
      role = await prisma.role.findUnique({ where: { id: roleId }, include: { permissions: true } })
    }
    if (!role && session.user.role) {
      role = await prisma.role.findUnique({ where: { name: session.user.role }, include: { permissions: true } })
    }
  } catch (e) {
    role = null
  }

  if (role && Array.isArray(role.permissions)) {
    const allowed = role.permissions.some((p: any) => p.permission === permissionName)
    if (allowed) return session
    throw new Error('Forbidden')
  }

  // Fallback: check legacy userPermission table
  const userPerms = await prisma.userPermission.findMany({ where: { userId: session.user.id }, include: { permission: true } })
  const allowed = userPerms.some((p) => p.permission.name === permissionName)
  if (!allowed) throw new Error('Forbidden')
  return session
}
