'use client'

import type { CSSProperties, MouseEvent } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  Bot,
  CheckCircle2,
  Code2,
  Cpu,
  DatabaseZap,
  ExternalLink,
  Globe,
  Layers3,
  LayoutDashboard,
  LineChart,
  Megaphone,
  MousePointer2,
  Network,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Store,
  Workflow,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const whatsappUrl =
  'https://wa.me/905069843195?text=Merhaba%2C%20SETRA%20TECH%20hizmetleri%20i%C3%A7in%20teklif%20almak%20istiyorum.'

const services: Array<{
  title: string
  description: string
  icon: LucideIcon
}> = [
  {
    title: 'Özel Yazılım Geliştirme',
    description:
      'İşletmenizin süreçlerine özel web uygulamaları, admin panelleri, dashboard sistemleri ve yönetim yazılımları geliştiriyoruz.',
    icon: Code2,
  },
  {
    title: 'E-Ticaret Altyapıları',
    description:
      'Modern, hızlı ve yönetilebilir e-ticaret siteleri kuruyor; ürün, stok, fiyat, sipariş ve müşteri süreçlerini tek merkezden yönetilebilir hale getiriyoruz.',
    icon: Store,
  },
  {
    title: 'Pazaryeri Entegrasyonları',
    description:
      'Trendyol ve benzeri pazaryerleriyle stok, fiyat, ürün ve sipariş entegrasyonları geliştirerek manuel iş yükünü azaltıyoruz.',
    icon: Workflow,
  },
  {
    title: 'Stok ve Fiyat Otomasyonu',
    description:
      'Pazaryeri, web sitesi ve veritabanı arasında otomatik stok ve fiyat senkronizasyonu sağlayarak ürün bilgilerinin güncel kalmasını sağlıyoruz.',
    icon: LineChart,
  },
  {
    title: 'Yapay Zeka Destekli Otomasyon',
    description:
      'Tekrarlayan işleri otomatikleştiren, veri işleyen, raporlayan ve karar süreçlerini destekleyen yapay zeka tabanlı çözümler geliştiriyoruz.',
    icon: BrainCircuit,
  },
  {
    title: 'Görüntü İşleme ve Bilgisayarlı Görü',
    description:
      'Kamera sistemleri, hedef takibi, QR/etiket okuma, nesne algılama ve görüntü analizine dayalı özel çözümler geliştiriyoruz.',
    icon: ScanSearch,
  },
  {
    title: 'Kurumsal Dashboard ve Raporlama',
    description:
      'Satış, stok, performans, operasyon ve finans verilerini anlaşılır panellerle takip edilebilir hale getiriyoruz.',
    icon: LayoutDashboard,
  },
  {
    title: 'Web Site ve Landing Page Tasarımı',
    description:
      'Markanız için hızlı, modern, SEO uyumlu ve dönüşüm odaklı web siteleri ve landing page tasarımları hazırlıyoruz.',
    icon: Globe,
  },
  {
    title: 'Reklam ve Lead Toplama Sistemleri',
    description:
      'Google Ads, form altyapıları, randevu sistemleri ve müşteri toplama süreçleri için dijital çözümler oluşturuyoruz.',
    icon: Megaphone,
  },
  {
    title: 'Veritabanı, API ve Entegrasyon Çözümleri',
    description:
      'Mevcut sistemlerinizin birbiriyle konuşmasını sağlayan API, veritabanı, bulut ve entegrasyon altyapıları geliştiriyoruz.',
    icon: DatabaseZap,
  },
]

const reasons = [
  'İşletmeye özel çözüm yaklaşımı',
  'Gereksiz karmaşa olmadan net ve uygulanabilir sistemler',
  'E-ticaret, otomasyon ve yazılımı birlikte düşünen yapı',
  'Modern teknolojilerle ölçeklenebilir altyapı',
  'Yönetilebilir admin panelleri',
  'Performans, güvenlik ve sürdürülebilirlik odaklı geliştirme',
]

const workAreas = [
  'E-Ticaret',
  'Moda & Perakende',
  'Pazaryeri Entegrasyonları',
  'Admin Panel Sistemleri',
  'Otomasyon Yazılımları',
  'Yapay Zeka Uygulamaları',
  'Görüntü İşleme',
  'Kurumsal Raporlama',
  'Web Tasarım',
  'API Entegrasyonları',
  'Bulut & Veritabanı',
  'Lead Toplama Sistemleri',
]

const processSteps = [
  {
    step: '01',
    title: 'Analiz',
    description: 'İhtiyacınızı, mevcut sisteminizi ve hedeflerinizi netleştiriyoruz.',
    icon: MousePointer2,
  },
  {
    step: '02',
    title: 'Planlama',
    description: 'Teknik altyapı, ekranlar, veri akışı ve entegrasyon yapısını planlıyoruz.',
    icon: Layers3,
  },
  {
    step: '03',
    title: 'Geliştirme',
    description: 'Modern, güvenli ve sürdürülebilir kod yapısıyla sistemi geliştiriyoruz.',
    icon: Cpu,
  },
  {
    step: '04',
    title: 'Teslim & Destek',
    description: 'Projeyi yayına alıyor, test ediyor ve ihtiyaç halinde geliştirmeye devam ediyoruz.',
    icon: ShieldCheck,
  },
]

const stats = [
  {
    value: '10+',
    label: 'Hizmet alanı',
  },
  {
    value: '24/7',
    label: 'Dijital süreç mantığı',
  },
  {
    value: 'API',
    label: 'Entegrasyon odaklı yapı',
  },
]

const stackItems = [
  {
    label: 'Frontend',
    value: 'Next.js / React',
  },
  {
    label: 'Backend',
    value: 'Node.js / API',
  },
  {
    label: 'Database',
    value: 'PostgreSQL / Prisma',
  },
  {
    label: 'Automation',
    value: 'AI / Workflow',
  },
]

function handleSpotlightMove(event: MouseEvent<HTMLElement>) {
  const target = event.currentTarget
  const rect = target.getBoundingClientRect()

  target.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`)
  target.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`)
}

function handleTiltMove(event: MouseEvent<HTMLElement>) {
  const target = event.currentTarget
  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const rotateX = ((y / rect.height - 0.5) * -10).toFixed(2)
  const rotateY = ((x / rect.width - 0.5) * 10).toFixed(2)

  target.style.setProperty('--tilt-x', `${rotateX}deg`)
  target.style.setProperty('--tilt-y', `${rotateY}deg`)
  target.style.setProperty('--shine-x', `${x}px`)
  target.style.setProperty('--shine-y', `${y}px`)
}

function handleTiltLeave(event: MouseEvent<HTMLElement>) {
  const target = event.currentTarget

  target.style.setProperty('--tilt-x', '0deg')
  target.style.setProperty('--tilt-y', '0deg')
}

function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string
  title: string
  description?: string
  center?: boolean
}) {
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
        {eyebrow}
      </p>
      <h2 className="font-serif text-3xl tracking-tight text-white md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-white/60 md:text-lg">{description}</p>
      ) : null}
    </div>
  )
}

function SpotlightCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      onMouseMove={handleSpotlightMove}
      className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37]/40 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={
          {
            background:
              'radial-gradient(520px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(212, 175, 55, 0.18), transparent 42%)',
          } as CSSProperties
        }
      />
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10" />
      <div className="relative">{children}</div>
    </div>
  )
}

function ServiceCard({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <SpotlightCard>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#d4af37] group-hover:text-black">
            <Icon className="h-5 w-5" />
          </div>
          <ArrowRight className="h-5 w-5 translate-x-2 text-white/20 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-[#d4af37] group-hover:opacity-100" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/58">{description}</p>
      </div>
    </SpotlightCard>
  )
}

function FloatingCodePanel() {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 p-4 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-400/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
        <span className="h-3 w-3 rounded-full bg-green-400/80" />
        <span className="ml-auto text-xs uppercase tracking-[0.24em] text-white/35">Live Build</span>
      </div>

      <div className="space-y-3 font-mono text-xs leading-6 text-white/70">
        <p>
          <span className="text-[#d4af37]">const</span>{' '}
          <span className="text-white">setraTech</span> = {'{'}
        </p>
        <p className="pl-4">
          services: <span className="text-emerald-300">"software + automation"</span>,
        </p>
        <p className="pl-4">
          source: <span className="text-emerald-300">"business needs"</span>,
        </p>
        <p className="pl-4">
          result: <span className="text-emerald-300">"scalable system"</span>,
        </p>
        <p>{'}'}</p>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="setra-scan-line h-px w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
        <div className="grid grid-cols-3 gap-px bg-white/10 text-center">
          {['API', 'AI', 'DATA'].map((item) => (
            <div key={item} className="bg-black/45 px-3 py-4">
              <p className="text-xs font-semibold tracking-[0.25em] text-[#d4af37]">{item}</p>
              <p className="mt-1 text-[11px] text-white/40">READY</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HeroSystemCard() {
  return (
    <div
      onMouseMove={handleTiltMove}
      onMouseLeave={handleTiltLeave}
      className="setra-tilt-card relative mx-auto max-w-xl transition-transform duration-200 ease-out"
      style={
        {
          transform:
            'perspective(1200px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))',
          transformStyle: 'preserve-3d',
        } as CSSProperties
      }
    >
      <div className="absolute -inset-10 rounded-[3rem] bg-[#d4af37]/20 blur-3xl" />

      <Card className="relative overflow-hidden rounded-[2.5rem] border-white/10 bg-white/[0.055] text-white shadow-[0_40px_140px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={
            {
              background:
                'radial-gradient(480px circle at var(--shine-x, 50%) var(--shine-y, 50%), rgba(255,255,255,0.16), transparent 45%)',
            } as CSSProperties
          }
        />

        <CardContent className="relative p-5 md:p-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Badge className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/12 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#d4af37] hover:bg-[#d4af37]/12">
              AUTOMATION Stack
            </Badge>
            <div className="flex items-center gap-2 text-xs text-white/45">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              Online
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4af37] text-black">
                <Store className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold">E-Ticaret Katmanı</p>
              <p className="mt-2 text-xs leading-6 text-white/50">Ürün, stok, fiyat, sipariş ve müşteri akışları</p>

              <div className="mt-5 space-y-2">
                {['Product Sync', 'Price Update', 'Order Flow'].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-xl bg-white/[0.055] px-3 py-2">
                    <span className="text-xs text-white/55">{item}</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                  <Bot className="h-5 w-5" />
                </div>
                <Network className="h-5 w-5 text-[#d4af37]" />
              </div>
              <p className="text-sm font-semibold">Otomasyon Motoru</p>
              <p className="mt-2 text-xs leading-6 text-white/50">AI destekli iş akışları ve API entegrasyonları</p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { label: 'API', icon: DatabaseZap },
                  { label: 'AI', icon: BrainCircuit },
                  { label: 'Panel', icon: BarChart3 },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center">
                    <Icon className="mx-auto h-4 w-4 text-[#d4af37]" />
                    <p className="mt-2 text-[11px] text-white/55">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xl font-semibold text-white">{item.value}</p>
                <p className="mt-1 text-xs text-white/45">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.24em] text-white/35">Infrastructure</p>
              <Zap className="h-4 w-4 text-[#d4af37]" />
            </div>

            <div className="grid gap-2">
              {stackItems.map((item, index) => (
                <div key={item.label} className="grid grid-cols-[0.8fr_1.2fr] items-center gap-3">
                  <span className="text-xs text-white/45">{item.label}</span>
                  <div className="overflow-hidden rounded-full bg-white/10">
                    <div
                      className="setra-progress h-2 rounded-full bg-gradient-to-r from-[#d4af37] to-white"
                      style={{ width: `${72 + index * 7}%`, animationDelay: `${index * 120}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="setra-float absolute -right-4 -top-5 hidden rounded-2xl border border-white/10 bg-black/50 p-4 shadow-2xl backdrop-blur-xl md:block">
        <Sparkles className="h-5 w-5 text-[#d4af37]" />
      </div>

      <div className="setra-float-delayed absolute -bottom-8 -left-6 hidden w-56 md:block">
        <FloatingCodePanel />
      </div>
    </div>
  )
}

export default function SetraTechClient() {
  const [mouse, setMouse] = useState({ x: -500, y: -500 })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const handleMove = (event: PointerEvent) => {
      setMouse({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('pointermove', handleMove)

    return () => {
      window.removeEventListener('pointermove', handleMove)
    }
  }, [])

  return (
    <main className="relative overflow-hidden bg-[#07070a] text-white">
      <style>
        {`
          @keyframes setra-float {
            0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
            50% { transform: translate3d(0, -14px, 0) rotate(1deg); }
          }

          @keyframes setra-float-delayed {
            0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
            50% { transform: translate3d(0, 12px, 0) rotate(-1deg); }
          }

          @keyframes setra-scan {
            0% { transform: translateX(-120%); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateX(120%); opacity: 0; }
          }

          @keyframes setra-progress {
            0% { transform: translateX(-100%); opacity: 0.2; }
            50% { opacity: 1; }
            100% { transform: translateX(0); opacity: 1; }
          }

          @keyframes setra-grid-move {
            0% { background-position: 0 0; }
            100% { background-position: 80px 80px; }
          }

          .setra-float {
            animation: setra-float 6s ease-in-out infinite;
          }

          .setra-float-delayed {
            animation: setra-float-delayed 7s ease-in-out infinite;
          }

          .setra-scan-line {
            animation: setra-scan 2.8s ease-in-out infinite;
          }

          .setra-progress {
            animation: setra-progress 1.2s ease-out both;
          }

          .setra-grid {
            background-image:
              linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
            background-size: 80px 80px;
            animation: setra-grid-move 28s linear infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .setra-float,
            .setra-float-delayed,
            .setra-scan-line,
            .setra-progress,
            .setra-grid {
              animation: none !important;
            }

            .setra-tilt-card {
              transform: none !important;
            }
          }
        `}
      </style>

      <div
        className="pointer-events-none fixed z-50 h-96 w-96 rounded-full bg-[#d4af37]/18 blur-3xl transition-opacity duration-500"
        style={{
          left: mouse.x - 192,
          top: mouse.y - 192,
          opacity: isMounted ? 1 : 0,
        }}
      />

      <div className="pointer-events-none absolute inset-0 setra-grid opacity-45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.22),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.10),transparent_26%),linear-gradient(to_bottom,rgba(7,7,10,0.25),#07070a_78%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[#d4af37]/10 blur-[120px]" />

      <section className="relative container mx-auto px-4 pb-20 pt-24 lg:pb-28 lg:pt-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-3xl">
            <Badge className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-1.5 text-xs uppercase tracking-[0.28em] text-[#d4af37] hover:bg-[#d4af37]/10">
              SETRA DIGITAL LINE
            </Badge>

            <h1 className="mt-7 font-serif text-5xl leading-[0.92] tracking-tight text-white md:text-6xl lg:text-7xl">
              SETRA TECH ile işinizi dijitalde güçlendirin
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/64 md:text-xl">
              E-ticaret altyapılarından özel yazılımlara, yapay zeka destekli otomasyonlardan
              entegrasyon çözümlerine kadar işletmelerin dijital süreçlerini daha hızlı, daha güvenli
              ve daha verimli hale getiriyoruz.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full bg-[#d4af37] px-7 text-black hover:bg-[#e3c65c]">
                <Link href="#services">
                  Hizmetleri İncele
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/15 bg-white/[0.04] px-7 text-white hover:bg-white hover:text-black"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  Teklif Al
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                ['Özel yazılım', 'İhtiyaca uygun, sade ve yönetilebilir yapılar'],
                ['Otomasyon', 'Tekrarlayan işleri hızla dijitalleştiren akışlar'],
                ['Entegrasyon', 'Sistemler arasında güvenli veri köprüleri'],
              ].map(([title, text]) => (
                <SpotlightCard key={title} className="rounded-3xl">
                  <div className="p-5">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/50">{text}</p>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>

          <HeroSystemCard />
        </div>
      </section>

      <section id="services" className="relative container mx-auto px-4 py-20 lg:py-28">
        <SectionHeading
          eyebrow="Hizmetlerimiz"
          title="Teknoloji, otomasyon ve dijital dönüşüm için uçtan uca çözümler"
          description="SETRA TECH, moda ve e-ticaret tarafındaki operasyonel ihtiyaçları anlayan; aynı zamanda yazılım, entegrasyon ve otomasyon ekseninde kurumsal çözümler geliştiren bir teknoloji kolu gibi çalışır."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.035]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(212,175,55,0.14),transparent_34%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.08),transparent_30%)]" />

        <div className="relative container mx-auto grid gap-10 px-4 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-24">
          <div>
            <SectionHeading
              eyebrow="Neden SETRA TECH?"
              title="Yalnızca yazılım geliştirmiyor, işletmenizin işleyişini dijitalde güçlendiriyoruz"
            />

            <SpotlightCard className="mt-7">
              <div className="p-7">
                <p className="text-base leading-8 text-white/72">
                  SETRA TECH olarak yalnızca yazılım geliştirmiyoruz; işletmenin gerçek ihtiyacını
                  anlayarak satış, operasyon, stok, müşteri ve yönetim süreçlerini dijitalde daha
                  güçlü hale getiriyoruz.
                </p>
              </div>
            </SpotlightCard>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map((reason) => (
              <SpotlightCard key={reason} className="rounded-3xl">
                <div className="flex items-start gap-4 p-5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/12 text-[#d4af37]">
                    <BadgeCheck className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-white/75">{reason}</p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      <section className="relative container mx-auto px-4 py-20 lg:py-28">
        <SectionHeading
          eyebrow="Çalışma Alanlarımız"
          title="Markanızı birçok dijital kanalda tek çatı altında destekleriz"
          description="E-ticaret operasyonundan kurumsal yazılıma, lead toplama sistemlerinden bulut altyapılarına kadar kapsamlı bir teknoloji omurgası kuruyoruz."
          center
        />

        <div className="mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-3">
          {workAreas.map((area) => (
            <Badge
              key={area}
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-medium text-white/70 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4af37]/45 hover:bg-[#d4af37] hover:text-black"
            >
              {area}
            </Badge>
          ))}
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.03]">
        <div className="container mx-auto px-4 py-20 lg:py-24">
          <SectionHeading
            eyebrow="Süreç"
            title="Nasıl Çalışıyoruz?"
            description="Karmaşık teknolojiyi anlaşılır ve uygulanabilir adımlara dönüştürüyoruz."
          />

          <div className="relative mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-[#d4af37]/35 to-transparent xl:block" />

            {processSteps.map((step) => {
              const Icon = step.icon

              return (
                <SpotlightCard key={step.step} className="relative rounded-3xl">
                  <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
                        {step.step}
                      </p>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#d4af37]">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/55">{step.description}</p>
                  </div>
                </SpotlightCard>
              )
            })}
          </div>
        </div>
      </section>

      <section id="contact" className="relative container mx-auto px-4 py-20 lg:py-28">
        <div className="absolute left-1/2 top-1/2 h-[360px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4af37]/10 blur-[110px]" />

        <Card className="relative overflow-hidden rounded-[2.5rem] border border-[#d4af37]/20 bg-[#101014] text-white shadow-[0_34px_120px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.25),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_36%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

          <CardContent className="relative grid gap-9 p-7 md:p-9 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
                Teklif
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl lg:text-5xl">
                İşinizi dijitalde daha güçlü hale getirelim.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/68 md:text-lg">
                SETRA TECH ile e-ticaret, otomasyon, yazılım ve entegrasyon ihtiyaçlarınız için size
                özel çözümler geliştirebiliriz.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full bg-[#d4af37] px-7 text-black hover:bg-[#e3c65c]">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    WhatsApp’tan Teklif Al
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/[0.04] px-7 text-white hover:bg-white hover:text-black"
                >
                  <Link href="#services">Hizmetlere Geri Dön</Link>
                </Button>
              </div>
            </div>

            <div id="contact-details" className="grid gap-4 sm:grid-cols-2">
              {[
                { title: 'Hızlı değerlendirme', text: 'İhtiyaçları birlikte netleştiririz.' },
                { title: 'Net kapsam', text: 'Gereksiz karmaşa olmadan plan çıkarırız.' },
                { title: 'Ölçeklenebilir yapı', text: 'Gelecekte genişletmeye uygun kurarız.' },
                { title: 'Kurumsal destek', text: 'Teslimden sonra da sistemi takip ederiz.' },
              ].map((item) => (
                <SpotlightCard key={item.title} className="rounded-3xl">
                  <div className="p-5">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/55">{item.text}</p>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}