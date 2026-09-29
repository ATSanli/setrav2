'use client'

import Link from 'next/link'

export default function StorefrontError({ reset }: { error: Error; reset: () => void }) {
  return <div className="container mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 pt-20 text-center">
    <h1 className="font-serif text-3xl">Sayfa şu anda yüklenemiyor</h1>
    <p className="mt-4 text-muted-foreground">Lütfen biraz sonra tekrar deneyin veya koleksiyonumuza dönün.</p>
    <div className="mt-8 flex gap-3"><button className="border px-5 py-3" onClick={reset}>Tekrar dene</button><Link className="bg-primary px-5 py-3 text-primary-foreground" href="/">Ana sayfa</Link></div>
  </div>
}
