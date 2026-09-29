import Link from 'next/link'

export function InfoPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container mx-auto min-h-[65vh] max-w-3xl px-4 pb-20 pt-32">
      <nav className="mb-8 text-sm text-muted-foreground"><Link className="hover:underline" href="/">Ana Sayfa</Link> / {title}</nav>
      <h1 className="mb-8 font-serif text-4xl">{title}</h1>
      <div className="space-y-5 leading-7 text-muted-foreground">{children}</div>
    </div>
  )
}
