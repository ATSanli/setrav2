import { SessionProvider } from '@/components/providers/session-provider'
import { StorefrontShell } from '@/components/setra-tech/storefront-shell'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <StorefrontShell>{children}</StorefrontShell>
    </SessionProvider>
  )
}
