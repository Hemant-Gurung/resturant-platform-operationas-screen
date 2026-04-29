'use client'

import { useOrders } from '@/hooks/useOrders'
import { NavTabs } from '@/components/NavTabs'
import type { View } from '@/components/NavTabs'
import type { Order } from '@/types/order'

function CompletedCard({ order }: { order: Order }) {
  const items = order.orders_items ?? []
  const time = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const typeLabel = order.type === 'eat-in' ? `Table ${order.table_number ?? '?'}` : 'Takeaway'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-white font-semibold">{order.customer_name}</p>
          <p className="text-gray-500 text-xs">{order.customer_phone}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full capitalize">
            {order.status}
          </span>
          <span className="text-gray-600 text-xs">{time} · #{order.id}</span>
        </div>
      </div>

      <p className="text-gray-500 text-xs">{typeLabel}</p>

      {items.length > 0 && (
        <ul className="space-y-0.5 border-t border-gray-800 pt-2">
          {items.map((item, i) => (
            <li key={item.id ?? i} className="flex gap-2 text-sm text-gray-400">
              <span className="w-5 shrink-0">{item.quantity}×</span>
              <span className="flex-1">{item.name}</span>
              <span className="text-gray-600 text-xs">€{item.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}

      {order.notes && (
        <p className="text-gray-500 text-xs italic border-t border-gray-800 pt-2">{order.notes}</p>
      )}

      <p className="text-right text-gray-500 text-xs">
        Total: <span className="text-gray-300 font-semibold">€{order.total.toFixed(2)}</span>
      </p>
    </div>
  )
}

export function CompletedView({ current, onSwitch }: { current: View; onSwitch: (v: View) => void }) {
  const { orders } = useOrders(['completed', 'cancelled'])
  const sorted = [...orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <main className="min-h-screen bg-gray-950 p-4 pb-8">
      <header className="flex items-center justify-between mb-6">
        <NavTabs current={current} onSwitch={onSwitch} badge={{ completed: orders.length }} />
      </header>

      {sorted.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-700 text-xl select-none">
          No completed orders
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((order) => (
            <CompletedCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </main>
  )
}
