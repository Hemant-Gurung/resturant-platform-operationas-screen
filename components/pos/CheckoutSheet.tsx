'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { groupedVat, VAT_RATES } from '@/lib/vat'
import { useTrans } from '@/components/LocaleContext'
import type { CartItem } from '@/hooks/useCart'

type PaymentMethod = 'cash' | 'card'
type OrderType = 'takeaway' | 'eat-in'

export function CheckoutSheet({
  items,
  total,
  onDone,
  onCancel,
}: {
  items: CartItem[]
  total: number
  onDone: () => void
  onCancel: () => void
}) {
  const { t } = useTrans()
  const [orderType, setOrderType] = useState<OrderType>('takeaway')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('cash')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { byRate, totalExcl } = groupedVat(items)

  async function place() {
    if (!customerName.trim()) return setError(t('errCustomerName'))
    if (orderType === 'eat-in' && !tableNumber.trim()) return setError(t('errTableNumber'))

    setError('')
    setSubmitting(true)

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        restaurant: process.env.NEXT_PUBLIC_RESTAURANT!,
        type: orderType,
        status: 'pending',
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || null,
        table_number: orderType === 'eat-in' ? tableNumber.trim() : null,
        payment_method: payment,
        total: parseFloat(total.toFixed(2)),
      })
      .select()
      .single()

    if (orderErr || !order) {
      setError(t('errPlaceOrder'))
      setSubmitting(false)
      return
    }

    await supabase.from('orders_items').insert(
      items.map((item, i) => ({
        id: crypto.randomUUID(),
        _order: i,
        _parent_id: order.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        vat_rate: item.vatRate,
      }))
    )

    onDone()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm flex flex-col gap-4 p-6 shadow-2xl">

        <div className="flex items-center justify-between">
          <p className="font-mono font-bold text-[#2d2d2d] text-base tracking-wide">{t('confirmOrder')}</p>
          <button onClick={onCancel} className="text-[#bbb] hover:text-[#2d2d2d] text-2xl leading-none transition-colors">×</button>
        </div>

        {/* Order type */}
        <div className="flex gap-2">
          {(['takeaway', 'eat-in'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
                orderType === type
                  ? 'bg-[#ff7043] border-[#ff7043] text-white'
                  : 'bg-white border-[#e0d6cc] text-[#999] hover:border-[#ff7043]'
              }`}
            >
              {type === 'eat-in' ? t('eatIn') : t('takeaway')}
            </button>
          ))}
        </div>

        {/* Customer fields */}
        <input
          type="text"
          placeholder={t('customerName')}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="border-2 border-[#f0e8e0] rounded-xl px-4 py-2.5 text-sm text-[#2d2d2d] focus:outline-none focus:border-[#ff7043] placeholder:text-[#ccc]"
        />
        <input
          type="tel"
          placeholder={t('phone')}
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="border-2 border-[#f0e8e0] rounded-xl px-4 py-2.5 text-sm text-[#2d2d2d] focus:outline-none focus:border-[#ff7043] placeholder:text-[#ccc]"
        />
        {orderType === 'eat-in' && (
          <input
            type="text"
            placeholder={t('tableNumber')}
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="border-2 border-[#f0e8e0] rounded-xl px-4 py-2.5 text-sm text-[#2d2d2d] focus:outline-none focus:border-[#ff7043] placeholder:text-[#ccc]"
          />
        )}

        {/* Payment method */}
        <div>
          <p className="text-xs text-[#aaa] font-semibold mb-2 uppercase tracking-wide">{t('paymentLabel')}</p>
          <div className="flex gap-2">
            {(['cash', 'card'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPayment(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${
                  payment === m
                    ? 'bg-[#ff7043] border-[#ff7043] text-white'
                    : 'bg-white border-[#e0d6cc] text-[#999] hover:border-[#ff7043]'
                }`}
              >
                {m === 'cash' ? t('cash') : t('card')}
              </button>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="py-3 border-t-2 border-dashed border-[#f0e8e0] space-y-1.5">
          <div className="flex justify-between text-xs text-[#aaa]">
            <span>{t('exclVat')}</span>
            <span>€{totalExcl.toFixed(2)}</span>
          </div>
          {VAT_RATES.map((r) =>
            byRate[r] > 0.005 ? (
              <div key={r} className="flex justify-between text-xs text-[#aaa]">
                <span>{t('vatRate').replace('{rate}', String(r))}</span>
                <span>€{byRate[r].toFixed(2)}</span>
              </div>
            ) : null
          )}
          <div className="flex justify-between items-baseline pt-1">
            <span className="font-mono font-bold text-[#2d2d2d] text-sm">{t('total')}</span>
            <span className="font-mono font-bold text-xl text-[#2d2d2d]">€{total.toFixed(2)}</span>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs -mt-2">{error}</p>}

        <button
          onClick={place}
          disabled={submitting}
          className="w-full py-3 bg-[#ff7043] hover:bg-[#f4511e] active:bg-[#e64a19] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors"
        >
          {submitting ? t('placingOrder') : t('placeOrder')}
        </button>
      </div>
    </div>
  )
}
