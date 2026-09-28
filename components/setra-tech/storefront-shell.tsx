'use client'

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const techPath = '/setra-tech'

export function StorefrontShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isTech = pathname === techPath
  const previousPath = useRef(pathname)
  const startedByLink = useRef(false)
  const [active, setActive] = useState(isTech)
  const [sequence, setSequence] = useState(0)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const stopMotion = () => {
      if (reducedMotion.matches) setActive(false)
    }
    stopMotion()
    reducedMotion.addEventListener('change', stopMotion)
    return () => reducedMotion.removeEventListener('change', stopMotion)
  }, [])

  useEffect(() => {
    if (previousPath.current !== pathname) {
      if (isTech && !startedByLink.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setSequence((value) => value + 1)
        setActive(true)
      }
      previousPath.current = pathname
      startedByLink.current = false
    }
  }, [pathname, isTech])

  function handleNavigation(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || isTech) return
    const target = event.target
    if (!(target instanceof Element)) return
    const anchor = target.closest('a[href]')
    if (!anchor || anchor.getAttribute('target') === '_blank') return
    const destination = new URL(anchor.getAttribute('href') || '', window.location.href)
    if (destination.origin !== window.location.origin || destination.pathname !== techPath || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    startedByLink.current = true
    setSequence((value) => value + 1)
    setActive(true)
  }

  return (
    <div onClickCapture={handleNavigation} className="flex min-h-screen flex-col">
      {!isTech && <Header />}
      <main className="flex-1">{children}</main>
      {!isTech && <Footer />}

      {active && (
        <div
          key={sequence}
          className="tech-transition"
          aria-hidden="true"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) {
              setActive(false)
            }
          }}
        >
          <div className="tech-transition__mark">
            <svg viewBox="0 0 320 150" fill="none" role="presentation">
              <path className="tech-transition__trace" d="M22 28 160 75 297 22M25 120 160 75 296 124M160 7v68" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="22" cy="28" r="4" fill="currentColor" />
              <circle cx="297" cy="22" r="4" fill="currentColor" />
              <circle cx="25" cy="120" r="4" fill="currentColor" />
              <circle cx="296" cy="124" r="4" fill="currentColor" />
              <circle cx="160" cy="7" r="4" fill="currentColor" />
              <circle className="tech-transition__core" cx="160" cy="75" r="13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>SETRA <strong>TECH</strong></span>
          </div>
        </div>
      )}
    </div>
  )
}
