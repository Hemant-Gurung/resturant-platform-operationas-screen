'use client'

import { useEffect } from 'react'
import { useFullscreen } from '@/hooks/useFullscreen'
import { useTrans } from '@/components/SettingsContext'
import type { Trans } from '@/lib/i18n'

export type View = 'kitchen' | 'counter' | 'completed' | 'pos' | 'settings'

const TAB_IDS: View[] = ['kitchen', 'counter', 'completed', 'pos']
const TAB_KEY: Record<View, keyof Trans> = {
  kitchen: 'navKitchen',
  counter: 'navCounter',
  completed: 'navCompleted',
  pos: 'navPos',
  settings: 'settingsTitle',
}

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
  const { t } = useTrans()

  useEffect(() => {
    const label = t(TAB_KEY[current])
    document.title = count ? `${label} (${count})` : label
  }, [current, count, t])

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1">
        {TAB_IDS.map((id) => (
          <button
            key={id}
            onClick={() => onSwitch(id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              current === id
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t(TAB_KEY[id])}
            {badge?.[id] !== undefined && badge[id]! > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                current === id ? 'bg-gray-500 text-white' : 'bg-gray-800 text-gray-400'
              }`}>
                {badge[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => onSwitch('settings')}
        title="Settings"
        className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 rounded-lg hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

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
