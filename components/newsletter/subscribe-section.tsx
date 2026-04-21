 'use client'

import React, { useState } from 'react'
import { useT } from '@/components/providers/language-provider'
import { useToast } from '@/components/ui/use-toast'

export default function SubscribeSection({ variant = 'section1' }: { variant?: 'section1' | 'section2' }) {
  const t = useT()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setMessage(null)
    setError(null)

    if (!email.trim()) {
      setError(t('newsletter.messages.required'))
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang: localStorage.getItem('language') || 'tr' })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setMessage(t('newsletter.messages.success'))
        setEmail('')
        // show toast with discount code
        toast({
          title: 'Tebrikler!',
          description: `%10 indirim kodunuz: ${data.discountCode ?? 'WELCOME10'}`,
        })
      } else {
        setError(data.error || t('newsletter.messages.exists'))
      }
    } catch (err) {
      setError(t('newsletter.messages.invalid_email'))
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'section2') {
    return (
      <div className="newsletter-section-2 flex flex-col items-center text-center">
        <h3 className="text-xl font-medium">{t('newsletter.section2.title')}</h3>
        <p className="text-sm mb-4">{t('newsletter.section2.text')}</p>
        <form onSubmit={onSubmit} className="flex gap-2 w-full max-w-md">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('newsletter.section2.placeholder') || t('newsletter.section1.placeholder')}
            className="flex-1 px-4 py-3 border rounded bg-white/5"
          />
          <button type="submit" className="px-4 py-2 bg-primary-foreground text-primary rounded">
            {loading ? '...' : t('newsletter.section2.button')}
          </button>
        </form>
        {message && <p className="text-success mt-2">{message}</p>}
        {error && <p className="text-destructive mt-2">{error}</p>}
      </div>
    )
  }

  return (
    <div className="newsletter-section-1 flex flex-col items-center text-center">
      <h3 className="font-serif text-2xl mb-2">{t('newsletter.section1.title')}</h3>
      <p className="text-lg font-semibold mb-1">{t('newsletter.section1.subtitle')}</p>
      <p className="text-sm mb-4">{t('newsletter.section1.text')}</p>
      <form onSubmit={onSubmit} className="flex gap-2 w-full max-w-md">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletter.section1.placeholder')}
          className="flex-1 px-4 py-3 border rounded bg-white/5"
        />
        <button type="submit" className="px-6 py-3 bg-primary-foreground text-primary rounded">
          {loading ? '...' : t('newsletter.section1.button')}
        </button>
      </form>
      <p className="text-xs text-primary-foreground/70 mt-2">{t('newsletter.section1.note')}</p>
      {message && <p className="text-success mt-2">{message}</p>}
      {error && <p className="text-destructive mt-2">{error}</p>}
    </div>
  )
}
