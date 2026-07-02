import type { Metadata } from 'next'

import SetraTechClient from '@/components/setra-tech/setra-tech-client'

export const metadata: Metadata = {
  title: 'SETRA TECH | Yazılım, Otomasyon ve Dijital Dönüşüm',
  description:
    'SETRA TECH; e-ticaret, özel yazılım, yapay zeka, otomasyon, entegrasyon ve dijital dönüşüm çözümleri sunar.',
}

export default function SetraTechPage() {
  return <SetraTechClient />
}