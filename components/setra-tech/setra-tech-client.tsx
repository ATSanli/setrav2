'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, ArrowUpRight, BrainCircuit, Code2, Database, Globe2,
  Menu, Megaphone, ScanEye, Server, Workflow, X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { projectFilters, projects } from './content'

const whatsappUrl =
  'https://wa.me/905069843195?text=Merhaba%2C%20SETRA%20TECH%20hizmetleri%20i%C3%A7in%20teklif%20almak%20istiyorum.'

const services: { title: string; description: string; icon: LucideIcon }[] = [
  { title: 'Özel yazılım ve yönetim panelleri', description: 'İş akışınıza uygun web uygulamaları, rol bazlı paneller ve operasyon araçları.', icon: Code2 },
  { title: 'E-ticaret ve pazaryeri entegrasyonları', description: 'Mağaza deneyimi, katalog yönetimi ve pazaryeri veri akışları.', icon: Workflow },
  { title: 'Yapay zekâ ve iş otomasyonu', description: 'Tekrarlanan veri girişlerini ve karar destek süreçlerini sadeleştiren çözümler.', icon: BrainCircuit },
  { title: 'Görüntü işleme', description: 'Görsel veride algılama, sınıflandırma ve analiz gerektiren uygulamalar.', icon: ScanEye },
  { title: 'IT, sunucu ve bulut altyapısı', description: 'Barındırma, ağ ve bulut ihtiyaçlarını güvenlik ve büyüme hedefleriyle birlikte ele alma.', icon: Server },
  { title: 'Web sitesi tasarımı', description: 'Mobil uyumlu, erişilebilir ve yönetimi kolay kurumsal siteler.', icon: Globe2 },
  { title: 'Veri, API ve raporlama', description: 'Sistemler arası bağlantılar ve anlaşılır rapor ekranları.', icon: Database },
  { title: 'Dijital pazarlama', description: 'Kampanya sayfaları, ölçümleme ve dijital kanal planlaması.', icon: Megaphone },
]

const process = [
  { number: '01', title: 'Keşif', description: 'İhtiyacı, mevcut sistemi ve hedefi birlikte netleştiririz.' },
  { number: '02', title: 'Mimari', description: 'Ekranları, veri akışını ve uygulanabilir kapsamı planlarız.' },
  { number: '03', title: 'Geliştirme', description: 'Çözümü geliştirir, gerçek kullanım senaryolarıyla test ederiz.' },
  { number: '04', title: 'İyileştirme', description: 'Teslim sonrası ihtiyaçları değerlendirir, sistemi geliştiririz.' },
]

const capabilities = ['Next.js / React', 'Node.js / API', 'PostgreSQL / Prisma', 'OCR', 'Görüntü analizi', 'Bulut ve sunucu']

function TechNav() {
  const [open, setOpen] = useState(false)
  const links = [
    { href: '#projects', label: 'Projeler' },
    { href: '#services', label: 'Hizmetler' },
    { href: '#process', label: 'Yaklaşım' },
  ]

  return (
    <>
      <a href="#tech-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-[#b8f5eb] focus:px-5 focus:py-3 focus:text-[#08101b]">İçeriğe geç</a>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08101b]/95 text-white backdrop-blur-xl">
        <nav aria-label="SETRA TECH gezinme" className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="text-xs font-medium tracking-[0.28em] text-white/65 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8f5eb]" aria-label="SETRA mağazasına dön">SETRA</Link>
            <span aria-hidden="true" className="h-5 w-px bg-white/20" />
            <Link href="/setra-tech" className="whitespace-nowrap text-sm font-semibold tracking-[0.15em] text-[#b8f5eb] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8f5eb]">TECH<span className="text-[#e3c675]">.</span></Link>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {links.map((link) => <Link key={link.href} href={link.href} className="text-sm text-white/65 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8f5eb]">{link.label}</Link>)}
          </div>
          <div className="flex items-center gap-2">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#b8f5eb] px-4 text-xs font-semibold text-[#07131b] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8f5eb] sm:px-5 sm:text-sm">Teklif al <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>
            <button type="button" aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'} aria-expanded={open} aria-controls="tech-mobile-nav" onClick={() => setOpen(!open)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white md:hidden">
              {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        {open && <div id="tech-mobile-nav" className="flex flex-col gap-1 border-t border-white/10 px-5 py-3 md:hidden">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base text-white/80 focus-visible:outline-2 focus-visible:outline-[#b8f5eb]">{link.label}</Link>)}</div>}
      </header>
    </>
  )
}

function TechGraphic({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden="true" className={`relative isolate mx-auto aspect-square w-full ${compact ? 'max-w-[410px]' : 'max-w-[520px]'}`}>
      <div className="absolute inset-[7%] rounded-full border border-[#b8f5eb]/25 bg-[radial-gradient(circle,#23677140_0%,#17283b40_38%,transparent_72%)] shadow-[0_0_100px_#4dd4be1a]" />
      <div className="absolute inset-[18%] rounded-full border border-dashed border-[#b8f5eb]/25" />
      <div className="absolute inset-[30%] rounded-full border border-[#e3c675]/40" />
      <svg viewBox="0 0 500 500" className="absolute inset-0 h-full w-full text-[#b8f5eb]" fill="none" role="presentation">
        <path d="M43 157 250 250 447 92M72 391 250 250 435 380M250 28v222" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.4" />
        <path d="M43 157 250 250 447 92M72 391 250 250 435 380M250 28v222" stroke="currentColor" strokeOpacity=".38" strokeWidth="4" strokeDasharray="2 16" />
        {[[43,157],[447,92],[72,391],[435,380],[250,28]].map(([cx,cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill="currentColor" />)}
        <circle cx="250" cy="250" r="28" fill="#0c1e2c" stroke="#b8f5eb" strokeWidth="2" />
        <circle cx="250" cy="250" r="8" fill="#e3c675" />
      </svg>
      <div className="absolute left-[8%] top-[28%] h-2 w-2 rounded-full bg-[#e3c675] shadow-[0_0_20px_#e3c675] motion-safe:animate-pulse" />
      <div className="absolute bottom-[22%] right-[12%] h-2 w-2 rounded-full bg-[#b8f5eb] shadow-[0_0_20px_#b8f5eb] motion-safe:animate-pulse" />
    </div>
  )
}

function Portfolio() {
  const [filter, setFilter] = useState<(typeof projectFilters)[number]['id']>('all')
  const featured = projects[0]
  const visible = projects.slice(1).filter((project) => filter === 'all' || project.category === filter)

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative scroll-mt-20 border-t border-white/10 bg-[#0b1422] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b8f5eb]">01 / Seçilmiş işler</p>
            <h2 id="projects-title" className="mt-5 max-w-3xl font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">Fikirden çalışan sisteme.</h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/60">Her proje, gerçek bir iş ihtiyacına verilen farklı bir teknoloji yanıtı.</p>
        </div>

        <article aria-label="Öne çıkan referans: CompOS" className="relative isolate overflow-hidden rounded-[2rem] border border-[#b8f5eb]/25 bg-[linear-gradient(125deg,#173447_0%,#101c2d_50%,#111727_100%)] p-6 shadow-[0_30px_100px_#0007] sm:p-10 lg:p-14">
          <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full bg-[#7fe5d9]/10 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.12fr_.88fr]">
            <div>
              <p className="inline-flex rounded-full border border-[#b8f5eb]/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#b8f5eb]">Öne çıkan proje / 01</p>
              <h3 className="mt-8 font-serif text-5xl leading-[1.04] text-white sm:text-6xl lg:text-7xl">CompOS{' '}<span className="mt-3 block font-sans text-sm font-medium uppercase tracking-[0.2em] text-[#b8f5eb] sm:text-base">— Company OPERATING System</span></h3>
              <p className="mt-8 max-w-xl text-lg leading-8 text-white/85">{featured.solution}</p>
              <div className="mt-8 border-t border-white/15 pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Karşıladığı ihtiyaç</p>
                <p className="mt-2 max-w-lg text-sm leading-7 text-white/70">{featured.problem}</p>
              </div>
              <Link href="#contact" className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#b8f5eb] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8f5eb]">Benzer bir ihtiyaç için görüşelim <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            </div>
            <TechGraphic compact />
          </div>
        </article>

        <div className="mt-20 flex flex-col justify-between gap-6 border-b border-white/15 pb-7 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b8f5eb]">Proje arşivi</p>
            <h3 className="mt-3 font-serif text-3xl text-white sm:text-4xl">Diğer referanslar</h3>
          </div>
          <p className="max-w-md text-sm leading-6 text-white/55">Geliştirilen çözümü ve karşıladığı ihtiyacı kısa biçimde inceleyin.</p>
        </div>
        <div role="group" aria-label="Referansları filtrele" className="mt-6 flex flex-wrap gap-2">
          {projectFilters.map((item) => (
            <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} className={`rounded-full border px-4 py-2.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8f5eb] ${filter === item.id ? 'border-[#b8f5eb] bg-[#b8f5eb] font-semibold text-[#08101b]' : 'border-white/20 text-white/70 hover:border-[#b8f5eb]/60 hover:text-white'}`}>{item.label}</button>
          ))}
        </div>
        <div aria-live="polite" className="mt-7 grid gap-x-10 md:grid-cols-2">
          {visible.map((project) => {
            const position = projects.indexOf(project) + 1
            return (
              <article key={project.name} className="group grid gap-4 border-b border-white/15 py-8 sm:grid-cols-[3.5rem_1fr] sm:gap-5">
                <span aria-hidden="true" className="font-mono text-xs text-[#b8f5eb]/70">{String(position).padStart(2, '0')}</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#b8f5eb]">{project.area}</p>
                  <h4 className="mt-3 font-serif text-2xl leading-tight text-white transition group-hover:text-[#b8f5eb]">{project.name}</h4>
                  <p className="mt-4 text-sm leading-7 text-white/65"><span className="font-semibold text-white/85">İhtiyaç:</span> {project.problem}</p>
                  <p className="mt-2 text-sm leading-7 text-white/65"><span className="font-semibold text-white/85">Çözüm:</span> {project.solution}</p>
                  {project.href && <Link href={project.href} className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#b8f5eb] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8f5eb]">{project.linkLabel} <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function SetraTechClient() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#080e19] text-white selection:bg-[#b8f5eb]/30">
      <TechNav />
      <div id="tech-content">
        <section className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_70%_15%,#17394c_0%,#0c1a2b_39%,#080e19_76%)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(#b8f5eb22_1px,transparent_1px),linear-gradient(90deg,#b8f5eb22_1px,transparent_1px)] [background-size:72px_72px]" />
          <div className="relative mx-auto grid min-h-[690px] max-w-7xl items-center gap-8 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:py-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b8f5eb]">SETRA / Teknoloji Operasyonları</p>
              <h1 className="mt-7 max-w-3xl font-serif text-[clamp(3.6rem,8vw,7.5rem)] leading-[.92] tracking-tight">İşinizin <span className="text-[#b8f5eb]">yeni</span> çalışma biçimi.</h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-white/70 sm:text-xl">Özel yazılım, yapay zekâ ve entegrasyonlarla karmaşık süreçleri anlaşılır, yönetilebilir sistemlere dönüştürüyoruz.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="#projects" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#b8f5eb] px-6 text-sm font-semibold text-[#08101b] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8f5eb]">Projeleri incele <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
                <Link href="#services" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition hover:border-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8f5eb]">Hizmetleri keşfet</Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#e3c675]/40 px-6 text-sm font-semibold text-[#e3c675] transition hover:bg-[#e3c675] hover:text-[#08101b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8f5eb]">Teklif al <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>
              </div>
              <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-6 text-xs uppercase tracking-[0.2em] text-white/45"><span>Yazılım</span><span>Otomasyon</span><span>Veri</span><span>Yapay zekâ</span></div>
            </div>
            <TechGraphic />
          </div>
        </section>

        <Portfolio />

        <section id="services" aria-labelledby="services-title" className="scroll-mt-20 bg-[#edf3f2] py-20 text-[#112333] sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2e7177]">02 / Neler yapıyoruz</p>
              <h2 id="services-title" className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">Teknoloji, işinize hizmet etsin.</h2>
              <p className="mt-6 max-w-sm text-base leading-8 text-[#385060]">Tek bir kalıba göre değil, gerçek ihtiyaca göre tasarlanmış çözümler.</p>
              <Link href="#contact" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#126c72] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#126c72]">İhtiyacınızı anlatın <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            </div>
            <div>
              {services.map(({ title, description, icon: Icon }, index) => <article key={title} className="grid gap-4 border-b border-[#17394c]/15 py-6 first:pt-0 sm:grid-cols-[3rem_1fr] sm:gap-6">
                <Icon aria-hidden="true" className="h-7 w-7 text-[#217984]" />
                <div><p className="text-xs font-medium tracking-[0.2em] text-[#59737b]">{String(index + 1).padStart(2, '0')}</p><h3 className="mt-1 text-xl font-semibold sm:text-2xl">{title}</h3><p className="mt-2 text-sm leading-7 text-[#425965]">{description}</p></div>
              </article>)}
            </div>
          </div>
        </section>

        <section aria-labelledby="capabilities-title" className="border-y border-white/10 bg-[#0c1726] py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 id="capabilities-title" className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b8f5eb]">Teknoloji yetkinlikleri</h2>
            <div className="mt-7 flex flex-wrap gap-2.5">{capabilities.map((item) => <span key={item} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75">{item}</span>)}</div>
          </div>
        </section>

        <section id="process" aria-labelledby="process-title" className="scroll-mt-20 bg-[#080e19] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b8f5eb]">03 / Çalışma yaklaşımı</p>
            <h2 id="process-title" className="mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">Karmaşığı birlikte sadeleştiriyoruz.</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">{process.map((step) => <article key={step.number} className="border-t border-[#b8f5eb]/40 pt-5"><p className="font-mono text-xs text-[#b8f5eb]">{step.number}</p><h3 className="mt-5 text-xl font-semibold">{step.title}</h3><p className="mt-3 text-sm leading-7 text-white/60">{step.description}</p></article>)}</div>
          </div>
        </section>

        <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#b8f5eb]/25 bg-[radial-gradient(circle_at_85%_20%,#246e75_0%,#143345_37%,#102233_80%)] px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
            <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-32 h-96 w-96 rounded-full border border-[#b8f5eb]/20" />
            <div className="relative max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b8f5eb]">04 / Birlikte başlayalım</p>
              <h2 id="contact-title" className="mt-6 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">İşiniz için doğru sistemi konuşalım.</h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/70">İhtiyacınızı anlatın; kapsamı, olası yaklaşımı ve sonraki adımı birlikte netleştirelim.</p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#b8f5eb] px-6 text-sm font-semibold text-[#07131b] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8f5eb]">WhatsApp’tan teklif alın <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>
            </div>
          </div>
        </section>
      </div>
      <footer className="border-t border-white/10 bg-[#080e19] px-5 py-7 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-xs text-white/45 sm:flex-row"><span>© 2026 SETRA TECH</span><Link href="/" className="w-fit text-[#b8f5eb] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8f5eb]">SETRA mağazasına dön</Link></div></footer>
    </div>
  )
}
