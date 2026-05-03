'use client'

import { useState, useEffect } from 'react'
import { LoginView } from '@/components/LoginView'
import { KitchenView } from '@/components/KitchenView'
import { CounterView } from '@/components/CounterView'
import { CompletedView } from '@/components/CompletedView'
import { POSView } from '@/components/pos/POSView'
import { NotificationSubscriber } from '@/components/NotificationSubscriber'
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

  let activeView
  if (view === 'pos') activeView = <POSView onSwitch={switchView} />
  else if (view === 'counter') activeView = <CounterView current={view} onSwitch={switchView} />
  else if (view === 'completed') activeView = <CompletedView current={view} onSwitch={switchView} />
  else activeView = <KitchenView current={view} onSwitch={switchView} />

  return (
    <>
      <NotificationSubscriber />
      {activeView}
    </>
  )
}
