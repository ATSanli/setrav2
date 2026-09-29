import UsersManager from '@/components/admin/users-manager'
import { requireAdminOrSuper } from '@/lib/permissions'

export default async function AdminCustomersPage() {
  try {
    await requireAdminOrSuper()
  } catch {
    return <p className="p-6">Bu listeyi görüntüleme yetkiniz yok.</p>
  }

  return <div>
    <h1 className="mb-2 font-serif text-3xl">Kayıtlı Müşteriler</h1>
    <p className="mb-8 text-muted-foreground">Site üzerinden kayıt olan müşteri hesapları</p>
    <UsersManager customerOnly />
  </div>
}
