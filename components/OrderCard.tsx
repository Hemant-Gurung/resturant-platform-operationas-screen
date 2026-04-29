'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/types/order'

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: null,
  cancelled: null,
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const CARD_STYLE: Record<OrderStatus, string> = {
  pending: 'border-yellow-500 bg-yellow-950/40',
  preparing: 'border-blue-500 bg-blue-950/40',
  ready: 'border-green-500 bg-green-950/40',
  completed: 'border-gray-600 bg-gray-900/40',
  cancelled: 'border-red-900 bg-red-950/40',
}

const BADGE_STYLE: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500 text-black',
  preparing: 'bg-blue-500 text-white',
  ready: 'bg-green-500 text-black',
  completed: 'bg-gray-500 text-white',
  cancelled: 'bg-red-700 text-white',
}

const BTN_STYLE: Record<OrderStatus, string> = {
  pending: '',
  preparing: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700',
  ready: 'bg-green-600 hover:bg-green-500 active:bg-green-700',
  completed: 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700',
  cancelled: '',
}

export function OrderCard({ order }: { order: Order }) {
  const [loading, setLoading] = useState(false)
  const next = NEXT_STATUS[order.status]
  const elapsed = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)
  const items = order.orders_items ?? []

  async function advance() {
    if (!next || loading) return
    setLoading(true)
    await supabase.from('orders').update({ status: next }).eq('id', order.id)
    setLoading(false)
  }

  return (
    <div className={`rounded-xl border-2 p-4 flex flex-col gap-3 transition-colors ${CARD_STYLE[order.status]}`}>

      {/* Header: customer + status */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-white font-bold text-lg leading-tight">{order.customer_name}</p>
          <p className="text-gray-400 text-sm">{order.customer_phone}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${BADGE_STYLE[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
          <span className="text-gray-500 text-xs">{elapsed}m ago</span>
        </div>
      </div>

      {/* Order type + table */}
      <div className="flex gap-2 text-xs">
        <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full capitalize">
          {order.type === 'eat-in' ? `Dine-in · Table ${order.table_number ?? '?'}` : 'Takeaway'}
        </span>
        <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
          #{order.id}
        </span>
      </div>

      {/* Items */}
      {items.length > 0 ? (
        <ul className="space-y-1 border-t border-gray-700 pt-2">
          {items.map((item, i) => (
            <li key={item.id ?? i} className="flex items-baseline gap-2 text-sm">
              <span className="text-gray-400 font-bold w-5 shrink-0">{item.quantity}×</span>
              <span className="text-white flex-1">{item.name}</span>
              <span className="text-gray-500 text-xs">€{item.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 text-xs italic border-t border-gray-700 pt-2">No items loaded</p>
      )}

      {/* Customer note */}
      {order.notes && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-3 py-2">
          <p className="text-yellow-200 text-xs font-semibold mb-0.5">Customer note</p>
          <p className="text-yellow-100 text-sm">{order.notes}</p>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between items-center text-sm border-t border-gray-700 pt-2">
        <span className="text-gray-500">Total</span>
        <span className="text-white font-bold">€{order.total.toFixed(2)}</span>
      </div>

      {/* Action button */}
      {next && (
        <button
          onClick={advance}
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-white font-bold text-sm transition-colors disabled:opacity-40 ${BTN_STYLE[next]}`}
        >
          {loading ? '…' : `Mark ${STATUS_LABEL[next]}`}
        </button>
      )}
    </div>
  )
}
