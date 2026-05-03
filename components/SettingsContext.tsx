'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { t, fill, LOCALES, type Locale, type Trans } from '@/lib/i18n'

const DEFAULT_LOCALE: Locale = (process.env.NEXT_PUBLIC_LOCALE as Locale | undefined) ?? 'en'

type Settings = {
  locale: Locale
  soundEnabled: boolean
}

type Ctx = Settings & {
  setLocale: (l: Locale) => void
  setSoundEnabled: (v: boolean) => void
}

const SettingsCtx = createContext<Ctx>({
  locale: DEFAULT_LOCALE,
  soundEnabled: true,
  setLocale: () => {},
  setSoundEnabled: () => {},
})

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [soundEnabled, setSoundEnabledState] = useState(true)

  useEffect(() => {
    const savedLocale = localStorage.getItem('ops_locale') as Locale | null
    if (savedLocale && (LOCALES as string[]).includes(savedLocale)) setLocaleState(savedLocale)

    const savedSound = localStorage.getItem('ops_sound')
    if (savedSound !== null) setSoundEnabledState(savedSound !== 'false')
  }, [])

  function setLocale(l: Locale) {
    localStorage.setItem('ops_locale', l)
    setLocaleState(l)
  }

  function setSoundEnabled(v: boolean) {
    localStorage.setItem('ops_sound', String(v))
    setSoundEnabledState(v)
  }

  return (
    <SettingsCtx.Provider value={{ locale, soundEnabled, setLocale, setSoundEnabled }}>
      {children}
    </SettingsCtx.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsCtx)
}

export function useTrans() {
  const { locale } = useSettings()
  return {
    locale,
    t: (key: keyof Trans) => t(key, locale),
    fill: (key: keyof Trans, vars: Record<string, string | number>) =>
      fill(t(key, locale), vars),
  }
}
