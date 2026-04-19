import UsersManager from '@/components/admin/users-manager'
import { translations } from '@/translations'
import { requirePermission } from '@/lib/permissions'

export default async function Page() {
  try {
    await requirePermission('user_manage')
  } catch {
    return <p className="p-6">{translations.tr.unauthorized}</p>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif">{translations.tr.users}</h1>
        <p className="text-muted-foreground">{translations.tr.manage_users ?? 'Manage admin and application users'}</p>
      </div>
      {/* @ts-expect-error Server -> Client */}
      <UsersManager />
    </div>
  )
}
