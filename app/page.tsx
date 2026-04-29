'use client'

import { useState, useEffect } from 'react'
import { LoginView } from '@/components/LoginView'
import { KitchenView } from '@/components/KitchenView'
import { CounterView } from '@/components/CounterView'
import { CompletedView } from '@/components/CompletedView'
import type { View } from '@/components/NavTabs'

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [view, setView] = useState<View>('kitchen')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('ops_auth')
    const saved = localStorage.getItem('ops_view') as View | null
    if (auth === '1') setAuthenticated(true)
    if (saved) setView(saved)
    setHydrated(true)
  }, [])

  function handleAuth() {
    localStorage.setItem('ops_auth', '1')
    setAuthenticated(true)
  }

  function switchView(v: View) {
    localStorage.setItem('ops_view', v)
    setView(v)
  }

  if (!hydrated) return null
  if (!authenticated) return <LoginView onAuth={handleAuth} />

  if (view === 'counter') return <CounterView current={view} onSwitch={switchView} />
  if (view === 'completed') return <CompletedView current={view} onSwitch={switchView} />
  return <KitchenView current={view} onSwitch={switchView} />
}
