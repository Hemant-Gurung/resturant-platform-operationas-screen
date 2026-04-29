'use client'

import { useEffect } from 'react'
import { useOrders } from '@/hooks/useOrders'
import { useSound } from '@/hooks/useSound'
import { OrderCard } from '@/components/OrderCard'
import { NavTabs } from '@/components/NavTabs'
import type { View } from '@/components/NavTabs'

export function KitchenView({ current, onSwitch }: { current: View; onSwitch: (v: View) => void }) {
  const { play } = useSound()
  const { orders } = useOrders(['pending', 'preparing', 'ready'] as const, play)

  useEffect(() => {
    const unlock = () => new AudioContext().resume()
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  const counts = {
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
  }

  return (
    <main className="min-h-screen bg-gray-950 p-4 pb-8">
      <header className="flex items-center justify-between mb-6">
        <NavTabs current={current} onSwitch={onSwitch} badge={{ kitchen: orders.length }} count={orders.length} />
        <div className="flex gap-2 text-xs">
          <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
            {counts.pending} pending
          </span>
          <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
            {counts.preparing} preparing
          </span>
          <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
            {counts.ready} ready
          </span>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-700 text-xl select-none">
          No active orders
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </main>
  )
}
