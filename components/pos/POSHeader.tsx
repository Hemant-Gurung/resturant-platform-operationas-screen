'use client'

import { useEffect, useState } from 'react'
import { LOCALE_CODE } from '@/lib/i18n'
import { useTrans } from '@/components/LocaleContext'
import type { View } from '@/components/NavTabs'

export function POSHeader({ onSwitch }: { onSwitch: (v: View) => void }) {
  const { locale } = useTrans()
  const [time, setTime] = useState('')

  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString(LOCALE_CODE[locale], { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [locale])

  const name = process.env.NEXT_PUBLIC_RESTAURANT_NAME ?? process.env.NEXT_PUBLIC_RESTAURANT ?? 'POS'

  return (
    <header className="bg-[#ff7043] px-5 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <span className="font-mono font-bold text-white text-sm tracking-wide uppercase">
          {name}
        </span>
        <div className="flex gap-1">
          {(['kitchen', 'pos'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => onSwitch(v)}
              className="text-white/60 hover:text-white text-xs px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors capitalize"
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSwitch('settings')}
          title="Settings"
          className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <span className="text-white/70 text-sm font-mono">{time}</span>
      </div>
    </header>
  )
}
