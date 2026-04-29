'use client'

import { useEffect, useState } from 'react'
import { useOrders } from '@/hooks/useOrders'
import { useSound } from '@/hooks/useSound'
import { OrderCard } from '@/components/OrderCard'
import { NavTabs } from '@/components/NavTabs'
import { NewOrderModal } from '@/components/NewOrderModal'
import type { View } from '@/components/NavTabs'

export function CounterView({ current, onSwitch }: { current: View; onSwitch: (v: View) => void }) {
  const { play } = useSound()
  const { orders } = useOrders(['ready'] as const, play)
  const [showNewOrder, setShowNewOrder] = useState(false)

  useEffect(() => {
    const unlock = () => new AudioContext().resume()
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 p-4 pb-8">
      {showNewOrder && <NewOrderModal onClose={() => setShowNewOrder(false)} />}

      <header className="flex items-center justify-between mb-6">
        <NavTabs current={current} onSwitch={onSwitch} badge={{ counter: orders.length }} count={orders.length} />
        <button
          onClick={() => setShowNewOrder(true)}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors"
        >
          + New Order
        </button>
      </header>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-700 text-xl select-none">
          No orders ready
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </main>
  )
}
