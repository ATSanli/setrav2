import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  Bot,
  Code2,
  DatabaseZap,
  Globe,
  LayoutDashboard,
  LineChart,
  Megaphone,
  ScanSearch,
  Store,
  Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'SETRA TECH | Yazılım, Otomasyon ve Dijital Dönüşüm',
  description:
    'SETRA TECH; e-ticaret, özel yazılım, yapay zeka, otomasyon, entegrasyon ve dijital dönüşüm çözümleri sunar.',
}

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
  },
  {
    step: '02',
    title: 'Planlama',
    description: 'Teknik altyapı, ekranlar, veri akışı ve entegrasyon yapısını planlıyoruz.',
  },
  {
    step: '03',
    title: 'Geliştirme',
    description: 'Modern, güvenli ve sürdürülebilir kod yapısıyla sistemi geliştiriyoruz.',
  },
  {
    step: '04',
    title: 'Teslim & Destek',
    description: 'Projeyi yayına alıyor, test ediyor ve ihtiyaç halinde geliştirmeye devam ediyoruz.',
  },
]

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="max-w-3xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-accent">
        {eyebrow}
      </p>
      <h2 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
          {description}
        </p>
      ) : null}
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
    <Card className="group h-full border-border/70 bg-card/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
      <CardContent className="p-6">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-secondary/60 text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function SetraTechPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-secondary/30 via-background to-accent/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.18),_transparent_55%),radial-gradient(circle_at_top_left,_rgba(17,24,39,0.08),_transparent_40%)]" />

      <section className="container mx-auto px-4 pb-16 pt-24 lg:pb-24 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.28em]">
              SETRA DIGITAL LINE
            </Badge>
            <h1 className="mt-6 font-serif text-5xl leading-[0.95] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              SETRA TECH ile işinizi dijitalde güçlendirin
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground md:text-xl">
              E-ticaret altyapılarından özel yazılımlara, yapay zeka destekli otomasyonlardan entegrasyon çözümlerine kadar işletmelerin dijital süreçlerini daha hızlı, daha güvenli ve daha verimli hale getiriyoruz.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="#services">
                  Hizmetleri İncele
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
                <Button asChild size="lg" variant="secondary" className="rounded-full px-6">
                <a
                    href="https://wa.me/905069843195?text=Merhaba%2C%20SETRA%20TECH%20hizmetleri%20i%C3%A7in%20teklif%20almak%20istiyorum."
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Teklif Al
                </a>
                </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['Özel yazılım', 'İhtiyaca uygun, sade ve yönetilebilir yapılar'],
                ['Otomasyon', 'Tekrarlayan işleri hızla dijitalleştiren akışlar'],
                ['Entegrasyon', 'Sistemler arasında güvenli veri köprüleri'],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-sm"
                >
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.16),_transparent_65%)] blur-2xl" />
            <Card className="relative overflow-hidden border-border/70 bg-card/85 p-0 shadow-[0_30px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <CardContent className="relative p-6 md:p-8">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),transparent_35%,rgba(212,175,55,0.12)_70%,transparent_100%)]" />
                <div className="relative flex items-center justify-between gap-4">
                  <Badge className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.25em]">
                    Automation Stack
                  </Badge>
                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Secure / Scalable / Modern
                  </span>
                </div>

                <div className="relative mt-8 rounded-[2rem] border border-border/70 bg-background/80 p-5 shadow-inner">
                  <div className="absolute left-1/2 top-8 h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-border/60" />
                  <div className="absolute left-6 right-6 top-1/2 h-px -translate-y-1/2 bg-border/60" />

                  <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">E-Ticaret Katmanı</p>
                          <p className="text-xs text-muted-foreground">Ürün, stok, sipariş, müşteri</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-card p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Otomasyon Motoru</p>
                          <p className="text-xs text-muted-foreground">AI akışları ve entegrasyonlar</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {[
                      { label: 'API', icon: DatabaseZap },
                      { label: 'Dashboard', icon: BarChart3 },
                      { label: 'Görüntü', icon: ScanSearch },
                    ].map(({ label, icon: Icon }) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-border/70 bg-white/90 p-4 text-center shadow-sm"
                      >
                        <Icon className="mx-auto h-5 w-5 text-accent" />
                        <p className="mt-2 text-sm font-medium text-foreground">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {['Yazılım mimarisi', 'Veri akışı', 'Kurumsal güvenlik'].map((item) => (
                      <div key={item} className="rounded-2xl border border-border/70 bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="services" className="container mx-auto px-4 py-20 lg:py-28">
        <SectionHeading
          eyebrow="Hizmetlerimiz"
          title="Teknoloji, otomasyon ve dijital dönüşüm için uçtan uca çözümler"
          description="SETRA TECH, moda ve e-ticaret tarafındaki operasyonel ihtiyaçları anlayan; aynı zamanda yazılım, entegrasyon ve otomasyon ekseninde kurumsal çözümler geliştiren bir teknoloji kolu gibi çalışır."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-secondary/20">
        <div className="container mx-auto grid gap-10 px-4 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-24">
          <div>
            <SectionHeading
              eyebrow="Neden SETRA TECH?"
              title="Yalnızca yazılım geliştirmiyor, işletmenizin işleyişini dijitalde güçlendiriyoruz"
            />
            <p className="mt-6 rounded-3xl border border-border/70 bg-card/80 p-6 text-base leading-8 text-foreground shadow-sm">
              SETRA TECH olarak yalnızca yazılım geliştirmiyoruz; işletmenin gerçek ihtiyacını anlayarak satış, operasyon, stok, müşteri ve yönetim süreçlerini dijitalde daha güçlü hale getiriyoruz.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map((reason) => (
              <Card key={reason} className="border-border/70 bg-card/90 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <CardContent className="flex items-start gap-3 p-5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <BadgeCheck className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-foreground">{reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 lg:py-28">
        <SectionHeading
          eyebrow="Çalışma Alanlarımız"
          title="SETRA TECH, markanızı birçok dijital kanalda tek çatı altında destekler"
          description="E-ticaret operasyonundan kurumsal yazılıma, lead toplama sistemlerinden bulut altyapılarına kadar kapsamlı bir teknoloji omurgası kuruyoruz."
        />

        <div className="mt-10 flex flex-wrap gap-3">
          {workAreas.map((area) => (
            <Badge
              key={area}
              variant="outline"
              className="rounded-full border-border/70 bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {area}
            </Badge>
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-secondary/15">
        <div className="container mx-auto px-4 py-20 lg:py-24">
          <SectionHeading
            eyebrow="Süreç"
            title="Nasıl Çalışıyoruz?"
            description="Karmaşık teknolojiyi anlaşılır ve uygulanabilir adımlara dönüştürüyoruz."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step) => (
              <Card key={step.step} className="group border-border/70 bg-card/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
                <CardContent className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                    {step.step}
                  </p>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="container mx-auto px-4 py-20 lg:py-28">
        <Card className="relative overflow-hidden border-0 bg-primary text-primary-foreground shadow-[0_24px_80px_rgba(0,0,0,0.16)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.22),_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.1),_transparent_45%)]" />
          <CardContent className="relative grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-foreground/70">
                Teklif
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl lg:text-5xl">
                İşinizi dijitalde daha güçlü hale getirelim.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-primary-foreground/80 md:text-lg">
                SETRA TECH ile e-ticaret, otomasyon, yazılım ve entegrasyon ihtiyaçlarınız için size özel çözümler geliştirebiliriz.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary" className="rounded-full px-6">
                <a
                    href="https://wa.me/905069843195?text=Merhaba%2C%20SETRA%20TECH%20hizmetleri%20i%C3%A7in%20teklif%20almak%20istiyorum."
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Teklif Al
                </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-primary-foreground/20 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
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
                <div key={item.title} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-5 backdrop-blur-sm">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-primary-foreground/75">{item.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}