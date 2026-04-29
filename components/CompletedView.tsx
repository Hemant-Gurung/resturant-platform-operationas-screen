'use client'

import { useState } from 'react'
import { useOrders } from '@/hooks/useOrders'
import { NavTabs } from '@/components/NavTabs'
import type { View } from '@/components/NavTabs'
import type { Order } from '@/types/order'

function dateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function dateKey(dateStr: string): string {
  return new Date(dateStr).toDateString()
}

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
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
            order.status === 'cancelled'
              ? 'bg-red-900 text-red-300'
              : 'bg-gray-700 text-gray-300'
          }`}>
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

function DateGroup({ label, orders, defaultOpen }: { label: string; orders: Order[]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const revenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0)

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-left group"
      >
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold transition-colors ${open ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
            {label}
          </span>
          <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-gray-600">
            €{revenue.toFixed(2)}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order) => (
            <CompletedCard key={order.id} order={order} />
          ))}
        </div>
      )}

      <div className="border-t border-gray-800/50" />
    </div>
  )
}

export function CompletedView({ current, onSwitch }: { current: View; onSwitch: (v: View) => void }) {
  const { orders } = useOrders(['completed', 'cancelled'])

  const sorted = [...orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Group by date
  const groups: { key: string; label: string; orders: Order[] }[] = []
  for (const order of sorted) {
    const key = dateKey(order.created_at)
    const existing = groups.find((g) => g.key === key)
    if (existing) {
      existing.orders.push(order)
    } else {
      groups.push({ key, label: dateLabel(order.created_at), orders: [order] })
    }
  }

  const todayRevenue = groups[0]?.label === 'Today'
    ? groups[0].orders.reduce((sum, o) => sum + (o.total ?? 0), 0)
    : 0

  return (
    <main className="min-h-screen bg-gray-950 p-4 pb-8">
      <header className="flex items-center justify-between mb-6">
        <NavTabs current={current} onSwitch={onSwitch} badge={{ completed: orders.length }} />
        {todayRevenue > 0 && (
          <span className="text-gray-500 text-sm">
            Today: <span className="text-white font-semibold">€{todayRevenue.toFixed(2)}</span>
          </span>
        )}
      </header>

      {groups.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-700 text-xl select-none">
          No completed orders
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group, i) => (
            <DateGroup
              key={group.key}
              label={group.label}
              orders={group.orders}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      )}
    </main>
  )
}
