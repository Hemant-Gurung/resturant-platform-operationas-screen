'use client'

import { useEffect } from 'react'
import { useFullscreen } from '@/hooks/useFullscreen'

export type View = 'kitchen' | 'counter' | 'completed' | 'pos'

const TABS: { id: View; label: string }[] = [
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'counter', label: 'Counter' },
  { id: 'completed', label: 'Completed' },
  { id: 'pos', label: 'POS' },
]

export function NavTabs({
  current,
  onSwitch,
  badge,
  count,
}: {
  current: View
  onSwitch: (v: View) => void
  badge?: Partial<Record<View, number>>
  count?: number
}) {
  const { isFullscreen, toggle } = useFullscreen()

  useEffect(() => {
    const label = current.charAt(0).toUpperCase() + current.slice(1)
    document.title = count ? `${label} (${count})` : label
  }, [current, count])

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSwitch(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              current === tab.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {badge?.[tab.id] !== undefined && badge[tab.id]! > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                current === tab.id ? 'bg-gray-500 text-white' : 'bg-gray-800 text-gray-400'
              }`}>
                {badge[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={toggle}
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 rounded-lg hover:bg-gray-800"
      >
        {isFullscreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        )}
      </button>
    </div>
  )
}
