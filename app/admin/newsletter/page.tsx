import NewsletterManager from '@/components/admin/newsletter-manager'
import { requireAdminOrSuper } from '@/lib/permissions'

export default async function AdminNewsletterPage() {
  try { await requireAdminOrSuper() } catch { return <p className="p-6">Bu listeyi görüntüleme yetkiniz yok.</p> }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Bülten Aboneleri</h1>
      <NewsletterManager />
    </div>
  )
}
