import Link from 'next/link'

export default function NotFound() {
  return <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
    <p className="mb-4 text-sm tracking-[0.3em] text-muted-foreground">SETRA</p>
    <h1 className="font-serif text-7xl">404</h1>
    <p className="mt-5 max-w-md text-muted-foreground">Aradığınız sayfa veya ürün bulunamadı. Koleksiyonumuzu keşfetmeye devam edebilirsiniz.</p>
    <div className="mt-8 flex flex-wrap justify-center gap-4">
      <Link className="bg-primary px-6 py-3 text-primary-foreground" href="/">Ana sayfa</Link>
      <Link className="border px-6 py-3" href="/urunler">Ürünler</Link>
    </div>
  </main>
}
