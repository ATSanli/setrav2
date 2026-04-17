import UsersManager from '@/components/admin/users-manager'
import { requirePermission } from '@/lib/permissions'

export default async function Page() {
  try {
    await requirePermission('user_manage')
  } catch {
    return <p className="p-6">Unauthorized</p>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif">Users</h1>
        <p className="text-muted-foreground">Manage admin and application users</p>
      </div>
      {/* @ts-expect-error Server -> Client */}
      <UsersManager />
    </div>
  )
}
