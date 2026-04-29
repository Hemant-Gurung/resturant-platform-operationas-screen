'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useMenuItems } from '@/hooks/useMenuItems'
import type { MenuItem } from '@/hooks/useMenuItems'

type CartItem = MenuItem & { quantity: number }

export function NewOrderModal({ onClose }: { onClose: () => void }) {
  const { grouped, loading } = useMenuItems()

  const [type, setType] = useState<'eat-in' | 'takeaway'>('takeaway')
  const [tableNumber, setTableNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCat, setActiveCat] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const selectedCat = activeCat ?? grouped[0]?.category.id ?? null
  const visibleItems = grouped.find((g) => g.category.id === selectedCat)?.items ?? []
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  function addItem(item: MenuItem) {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id)
      return exists
        ? prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
        : [...prev, { ...item, quantity: 1 }]
    })
  }

  function removeItem(id: number) {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === id)
      if (!exists) return prev
      if (exists.quantity === 1) return prev.filter((c) => c.id !== id)
      return prev.map((c) => c.id === id ? { ...c, quantity: c.quantity - 1 } : c)
    })
  }

  async function submit() {
    if (!customerName.trim()) return setError('Customer name is required')
    if (cart.length === 0) return setError('Add at least one item')
    if (type === 'eat-in' && !tableNumber.trim()) return setError('Table number is required')

    setError('')
    setSubmitting(true)

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        restaurant: process.env.NEXT_PUBLIC_RESTAURANT!,
        type,
        status: 'pending',
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        table_number: type === 'eat-in' ? tableNumber.trim() : null,
        notes: notes.trim() || null,
        total: parseFloat(total.toFixed(2)),
      })
      .select()
      .single()

    if (orderErr || !order) {
      setError('Failed to create order. Try again.')
      setSubmitting(false)
      return
    }

    await supabase.from('orders_items').insert(
      cart.map((item, i) => ({
        _order: i,
        _parent_id: order.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))
    )

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
          <h2 className="text-white text-xl font-bold">New Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

          {/* Order type */}
          <div className="flex gap-2">
            {(['takeaway', 'eat-in'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-colors ${
                  type === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {t === 'eat-in' ? 'Eat-in' : 'Takeaway'}
              </button>
            ))}
          </div>

          {type === 'eat-in' && (
            <input
              type="text"
              placeholder="Table number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="bg-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
            />
          )}

          {/* Customer */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Customer name *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
            />
          </div>

          {/* Menu */}
          <div className="flex flex-col gap-3">
            {loading ? (
              <p className="text-gray-600 text-sm text-center py-4">Loading menu…</p>
            ) : (
              <>
                {/* Category tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {grouped.map((g) => (
                    <button
                      key={g.category.id}
                      onClick={() => setActiveCat(g.category.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedCat === g.category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {g.category.name}
                    </button>
                  ))}
                </div>

                {/* Items grid */}
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                  {visibleItems.map((item) => {
                    const inCart = cart.find((c) => c.id === item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => addItem(item)}
                        className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                          inCart
                            ? 'border-blue-500 bg-blue-950/40 text-white'
                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <p className="text-sm font-medium leading-tight">{item.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">€{item.price.toFixed(2)}</p>
                          {inCart && (
                            <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                              {inCart.quantity}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="border-t border-gray-800 pt-3 space-y-2">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Order</p>
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-white text-sm flex-1">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center text-lg leading-none"
                    >
                      −
                    </button>
                    <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => addItem(item)}
                      className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center text-lg leading-none"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gray-500 text-sm w-16 text-right">
                    €{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-gray-800">
                <span className="text-gray-400 text-sm">Total</span>
                <span className="text-white font-bold">€{total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <textarea
            placeholder="Customer notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="bg-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 resize-none"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-800 shrink-0">
          <button
            onClick={submit}
            disabled={submitting || cart.length === 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl transition-colors"
          >
            {submitting ? 'Placing order…' : `Place Order · €${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
