'use client'

import { LOCALES, type Locale } from '@/lib/i18n'
import { useSettings, useTrans } from '@/components/SettingsContext'

export function SettingsView({ onBack }: { onBack: () => void }) {
  const { locale, setLocale, soundEnabled, setSoundEnabled } = useSettings()
  const { t } = useTrans()

  const LOCALE_LABEL: Record<Locale, string> = {
    en: 'English',
    fr: 'Français',
    nl: 'Nederlands',
  }

  return (
    <main className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>
        <h1 className="text-white font-bold text-xl">{t('settingsTitle')}</h1>
      </div>

      <div className="max-w-lg space-y-8">

        {/* Language */}
        <section>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
            {t('language')}
          </p>
          <div className="flex gap-3">
            {LOCALES.map((l: Locale) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`flex-1 py-4 rounded-2xl border-2 font-semibold text-sm transition-colors ${
                  locale === l
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                }`}
              >
                <span className="block text-lg font-bold uppercase mb-0.5">{l}</span>
                <span className="block text-xs font-normal opacity-70">{LOCALE_LABEL[l]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
            {t('notifications')}
          </p>
          <div className="bg-gray-900 rounded-2xl border border-gray-800 divide-y divide-gray-800">
            <label className="flex items-center justify-between px-5 py-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span className="text-white text-sm font-medium">{t('soundAlerts')}</span>
              </div>
              <button
                role="switch"
                aria-checked={soundEnabled}
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  soundEnabled ? 'bg-indigo-500' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </div>
        </section>

      </div>
    </main>
  )
}
