'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { ArrowRight, Truck, Shield, RotateCcw, Instagram, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/product-card'
import { useT } from '@/components/providers/language-provider'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

// Categories data
const categories = [
  { name: 'Elbise', slug: 'elbise', image: '/images/category-elbise.jpg' },
  { name: 'Etek', slug: 'etek', image: '/images/category-etek.jpg' },
  { name: 'Şal', slug: 'sal-esarp', image: '/images/category-sal.jpg' },
  { name: 'Takım', slug: 'takim', image: '/images/category-takim.jpg' },
]

// Instagram grid images
const instagramImages = [
  '/images/insta-1.jpg',
  '/images/insta-2.jpg',
  '/images/insta-3.jpg',
  '/images/insta-4.jpg',
  '/images/insta-5.jpg',
  '/images/insta-6.jpg',
]

function AnimatedSection({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
  const t = useT()
  const { data: productsData } = useSWR('/api/products?featured=true&limit=8', fetcher)
  const { data: newProductsData } = useSWR('/api/products?new=true&limit=4', fetcher)
  
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })
  
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])

  const featuredProducts = productsData?.products || []
  const newProducts = newProductsData?.products || []

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section - Cinematic Fullscreen */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0"
          style={{ scale: heroScale }}
        >
          <Image
            src="/images/hero-main.jpg"
            alt="SETRA Collection"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </motion.div>
        
        {/* Dark Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        
        {/* Animated Content */}
        <motion.div 
          className="relative z-10 h-full flex items-center justify-center text-center px-4"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <div className="max-w-4xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="inline-block text-white/80 text-sm uppercase tracking-[0.4em] mb-6"
            >
              {t('hero_tagline')}
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-[0.95] tracking-tight"
            >
              {t('hero_title_1')}
              <br />
              <span className="italic">{t('hero_title_2')}</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-white/90 text-lg md:text-xl mb-12 max-w-xl mx-auto font-light tracking-wide"
            >
              {t('hero_subtitle')}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <Button 
                size="lg" 
                asChild
                className="bg-white text-black hover:bg-white/90 rounded-none px-12 py-6 text-sm uppercase tracking-[0.2em] font-medium transition-all duration-500 hover:tracking-[0.3em]"
              >
                <Link href="/urunler">
                  {t('hero_cta')}
                  <ArrowRight className="ml-3 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2"
          >
            <motion.div 
              className="w-1 h-2 bg-white/80 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Category Showcase - Interactive Cards */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 block">
                {t('collections')}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight">
                {t('shop_by_category')}
              </h2>
            </div>
          </AnimatedSection>

          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            {categories.map((category) => (
              <motion.div key={category.slug} variants={scaleIn}>
                <Link
                  href={`/kategori/${category.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden bg-secondary"
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                  
                  {/* Glassmorphism overlay on hover */}
                  <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-sm p-4">
                      <h3 className="font-serif text-2xl text-white mb-2">{category.name}</h3>
                      <span className="text-white/80 text-sm uppercase tracking-widest flex items-center gap-2">
                        {t('explore')} <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  {/* Default title */}
                  <div className="absolute inset-x-0 bottom-0 p-6 group-hover:opacity-0 transition-opacity duration-300">
                    <h3 className="font-serif text-2xl lg:text-3xl text-white">{category.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bestsellers - Horizontal Scroll */}
      <section className="py-24 lg:py-32 bg-secondary/30">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 block">
                  {t('most_loved')}
                </span>
                <h2 className="font-serif text-4xl md:text-5xl tracking-tight">{t('bestsellers')}</h2>
              </div>
              <Button variant="ghost" asChild className="hidden md:flex group">
                <Link href="/urunler?sort=bestseller" className="text-sm uppercase tracking-widest">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>

          <div className="relative">
            <motion.div 
              className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
            >
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product: any) => (
                  <motion.div 
                    key={product.id} 
                    variants={scaleIn}
                    className="flex-none w-[280px] md:w-[320px] snap-start"
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      price={Number(product.price)}
                      comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
                      image={product.images?.[0]?.url || '/images/placeholder.jpg'}
                      category={product.category?.name || ''}
                      isFeatured={product.isFeatured}
                      colors={product.variants}
                    />
                  </motion.div>
                ))
              ) : (
                // Skeleton loaders
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-none w-[280px] md:w-[320px] snap-start">
                    <div className="space-y-4">
                      <div className="aspect-[3/4] bg-secondary animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 bg-secondary animate-pulse rounded w-1/3" />
                        <div className="h-5 bg-secondary animate-pulse rounded w-2/3" />
                        <div className="h-4 bg-secondary animate-pulse rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* New Collection Feature - Split Layout */}
      <section className="py-0 lg:py-0">
        <div className="grid lg:grid-cols-2 min-h-[80vh]">
          {/* Left - Image */}
          <div className="relative h-[60vh] lg:h-auto overflow-hidden">
            <motion.div
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="absolute inset-0"
            >
              <Image
                src="/images/collection-feature.jpg"
                alt="New Collection"
                fill
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 lg:to-transparent" />
          </div>

          {/* Right - Content */}
          <div className="flex items-center justify-center bg-primary text-primary-foreground p-8 lg:p-16">
            <AnimatedSection className="max-w-lg">
              <span className="text-sm uppercase tracking-[0.3em] text-primary-foreground/70 mb-6 block">
                New Season
              </span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
                The Art of 
                <span className="italic"> Modest</span>
                <br />Elegance
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-10 leading-relaxed">
                Discover our latest collection where timeless sophistication meets contemporary design. 
                Each piece is crafted with premium fabrics and meticulous attention to detail.
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                asChild
                className="rounded-none px-10 py-6 text-sm uppercase tracking-[0.2em] font-medium"
              >
                <Link href="/yeni-gelenler">
                  Explore Collection
                  <ArrowRight className="ml-3 h-4 w-4" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* New Arrivals Grid */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-sm uppercase tracking-[0.3em] text-accent font-medium mb-4 block">
                Just Arrived
              </span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight">
                New Arrivals
              </h2>
            </div>
          </AnimatedSection>

          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            {newProducts.length > 0 ? (
              newProducts.map((product: any) => (
                <motion.div key={product.id} variants={scaleIn}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={Number(product.price)}
                    comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
                    image={product.images?.[0]?.url || '/images/placeholder.jpg'}
                    category={product.category?.name || ''}
                    isNew={product.isNew}
                    colors={product.variants}
                  />
                </motion.div>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <motion.div key={i} variants={scaleIn}>
                  <div className="space-y-4">
                    <div className="aspect-[3/4] bg-secondary animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-secondary animate-pulse rounded w-1/3" />
                      <div className="h-5 bg-secondary animate-pulse rounded w-2/3" />
                      <div className="h-4 bg-secondary animate-pulse rounded w-1/4" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              asChild
              className="rounded-none px-10 py-6 text-sm uppercase tracking-[0.2em] border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <Link href="/yeni-gelenler">
                View All New Arrivals
                <ArrowRight className="ml-3 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            {[
              { icon: Truck, title: 'Hızlı Teslimat', desc: '2-4 iş günü içinde kapınızda' },
              { icon: Shield, title: 'Güvenli Ödeme', desc: '256-bit SSL şifreleme' },
              { icon: RotateCcw, title: 'Kolay İade', desc: '14 gün içinde ücretsiz iade' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-primary/20 rounded-full flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Instagram Grid */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-12">
              <Instagram className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
              <h2 className="font-serif text-3xl md:text-4xl mb-2">@setra.official</h2>
              <p className="text-muted-foreground">Follow us for daily inspiration</p>
            </div>
          </AnimatedSection>

          <motion.div 
            className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            {instagramImages.map((img, i) => (
              <motion.a
                key={i}
                href="https://instagram.com/setra.official"
                target="_blank"
                rel="noopener noreferrer"
                variants={scaleIn}
                className="group relative aspect-square overflow-hidden bg-secondary"
              >
                <Image
                  src={img}
                  alt={`Instagram ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <AnimatedSection className="max-w-2xl mx-auto text-center">
            <span className="text-sm uppercase tracking-[0.3em] text-primary-foreground/70 mb-4 block">
              Newsletter
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mb-4">
              Get 10% Off
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-10">
              {"Subscribe to our newsletter and get 10% off your first order."}
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 bg-transparent border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 rounded-none h-14 focus:border-primary-foreground"
              />
              <Button 
                type="submit"
                variant="secondary"
                className="rounded-none h-14 px-8 text-sm uppercase tracking-widest"
              >
                Subscribe
              </Button>
            </form>
            
            <p className="text-primary-foreground/50 text-sm mt-6">
              By subscribing, you agree to our Privacy Policy.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
