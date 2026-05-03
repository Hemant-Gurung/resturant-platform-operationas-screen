'use client'

import { useEffect, useState } from 'react'
import type { View } from '@/components/NavTabs'

export function POSHeader({ onSwitch }: { onSwitch: (v: View) => void }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [])

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
      <span className="text-white/70 text-sm font-mono">{time}</span>
    </header>
  )
}
