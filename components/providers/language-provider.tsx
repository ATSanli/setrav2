'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { translations } from '../../translations'

type Lang = 'tr' | 'en'

type LanguageContextValue = {
  language: Lang
  setLanguage: (l: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Lang>('tr')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('language')
      if (saved === 'tr' || saved === 'en') setLanguage(saved)
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('language', language)
    } catch (e) {
      // ignore
    }
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

export function useT() {
  const { language } = useLanguage()
  return (key: keyof typeof translations['tr']) => {
    return (translations as any)[language]?.[key] ?? String(key)
  }
}
