import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions, isSuperAdmin } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export const metadata = {
  title: 'Super Admin Panel | SETRA',
  description: 'SETRA Super Admin Dashboard'
}

export default async function SuperAdminLayout({ children, }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/giris?callbackUrl=/super-admin')
  }

  if (!isSuperAdmin(session.user.role)) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader user={session.user} />
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
