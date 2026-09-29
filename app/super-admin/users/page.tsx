import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/permissions'

async function updateRole(formData: FormData) {
  'use server'
  await requireSuperAdmin()
  const id = String(formData.get('id') || '')
  const role = String(formData.get('role') || '')
  if (!id || !['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) return
  const roleEntry = await prisma.role.findUnique({ where: { name: role } })
  await prisma.user.update({ where: { id }, data: { role, roleId: roleEntry?.id || null } })
  revalidatePath('/super-admin/users')
}

export default async function UsersPage() {
  await requireSuperAdmin()
  const users = await prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true, role: true }, orderBy: { createdAt: 'desc' } })

  return <div className="p-6">
    <h1 className="mb-4 text-2xl font-semibold">Kullanıcılar</h1>
    <div className="overflow-x-auto rounded bg-card p-4">
      {users.length ? <table className="w-full table-auto text-sm"><thead><tr><th className="text-left">E-posta</th><th className="text-left">Ad</th><th className="text-left">Rol</th><th className="text-left">İşlem</th></tr></thead><tbody>
        {users.map(user => <tr key={user.id} className="border-t"><td>{user.email}</td><td>{user.firstName} {user.lastName}</td><td>{user.role}</td><td><form action={updateRole} className="flex gap-2"><input type="hidden" name="id" value={user.id} /><select name="role" defaultValue={user.role} className="border bg-background p-2"><option value="USER">USER</option><option value="ADMIN">ADMIN</option><option value="SUPER_ADMIN">SUPER_ADMIN</option></select><button type="submit" className="border px-3">Güncelle</button></form></td></tr>)}
      </tbody></table> : <p>Kullanıcı bulunamadı.</p>}
    </div>
  </div>
}
