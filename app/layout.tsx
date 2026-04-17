import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    default: 'SETRA | Premium Modest Fashion',
    template: '%s | SETRA'
  },
  description: 'Zarif ve modern tesettür giyim koleksiyonu. Premium kalite, şık tasarımlar.',
  keywords: ['tesettür', 'modest fashion', 'hijab', 'abaya', 'ferace', 'turkish fashion'],
  authors: [{ name: 'SETRA' }],
  creator: 'SETRA',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'SETRA',
    title: 'SETRA | Premium Modest Fashion',
    description: 'Zarif ve modern tesettür giyim koleksiyonu'
  }
}

export const viewport: Viewport = {
  themeColor: '#1a1a1a',
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
