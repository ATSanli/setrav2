import { requireSuperAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import RoleManager from '@/components/super-admin/role-manager'

export default async function Page() {
  await requireSuperAdmin()
  // Ensure default roles exist
  const defaultRoles = ['USER', 'ADMIN', 'SUPER_ADMIN']
  for (const name of defaultRoles) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } })
  }
  const roles = await prisma.role.findMany({ include: { permissions: true }, orderBy: { name: 'asc' } })
  const formatted = roles.map(r => ({ id: r.id, name: r.name, permissions: r.permissions.map((p: any) => p.permission) }))
  return (
    <div className="min-h-screen p-6 bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Role Permissions</h1>
        {/* @ts-expect-error Server -> Client */}
        <RoleManager initialRoles={formatted} />
      </div>
    </div>
  )
}
