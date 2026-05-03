'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { groupedVat, VAT_RATES } from '@/lib/vat'
import { useTrans } from '@/components/LocaleContext'
import { LOCALE_CODE } from '@/lib/i18n'
import type { Order, OrderStatus } from '@/types/order'

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: null,
  cancelled: null,
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

const CANCELLABLE: OrderStatus[] = ['pending', 'preparing', 'ready']

function CancelConfirm({
  onConfirm,
  onDismiss,
  title,
  warning,
  keep,
  yes,
}: {
  onConfirm: () => void
  onDismiss: () => void
  title: string
  warning: string
  keep: string
  yes: string
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
        <div>
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <p className="text-gray-400 text-sm mt-1">{warning}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition-colors"
          >
            {keep}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-semibold text-sm transition-colors"
          >
            {yes}
          </button>
        </div>
      </div>
    </div>
  )
}

export function OrderCard({ order, onReprint }: { order: Order; onReprint?: (order: Order) => void }) {
  const { t, fill, locale } = useTrans()
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const next = NEXT_STATUS[order.status]
  const elapsed = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)
  const items = order.orders_items ?? []
  const canCancel = CANCELLABLE.includes(order.status)
  const vatLines = (order.orders_items ?? []).map((i) => ({
    price: i.price,
    quantity: i.quantity,
    vatRate: (i.vat_rate ?? 12) as 6 | 12 | 21,
  }))
  const { byRate, totalVat, totalExcl } = groupedVat(vatLines)

  const statusLabel: Record<string, string> = {
    pending: t('pending'),
    preparing: t('preparing'),
    ready: t('ready'),
    completed: t('completed'),
    cancelled: t('cancelled'),
  }

  async function advance() {
    if (!next || loading) return
    setLoading(true)
    await supabase.from('orders').update({ status: next }).eq('id', order.id)
    setLoading(false)
  }

  async function cancel() {
    setConfirming(false)
    setLoading(true)
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
    setLoading(false)
  }

  return (
    <>
      {confirming && (
        <CancelConfirm
          onConfirm={cancel}
          onDismiss={() => setConfirming(false)}
          title={t('cancelTitle')}
          warning={t('cancelWarning')}
          keep={t('keepOrder')}
          yes={t('yesCancel')}
        />
      )}

      <div className={`rounded-xl border-2 p-4 flex flex-col gap-3 transition-colors ${CARD_STYLE[order.status]}`}>

        {/* Header: customer + status */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-white font-bold text-lg leading-tight">{order.customer_name}</p>
            <p className="text-gray-400 text-sm">{order.customer_phone}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${BADGE_STYLE[order.status]}`}>
              {statusLabel[order.status]}
            </span>
            <span className="text-gray-500 text-xs">{fill('minutesAgo', { n: elapsed })}</span>
          </div>
        </div>

        {/* Order type + table */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full capitalize">
            {order.type === 'eat-in'
              ? fill('dineIn', { n: order.table_number ?? '?' })
              : order.type === 'delivery'
              ? t('delivery')
              : t('takeaway')}
          </span>
          {order.pickup_time && (
            <span className="bg-gray-800 text-yellow-300 px-2 py-0.5 rounded-full">
              {fill('pickupLabel', { time: order.pickup_time })}
            </span>
          )}
          {order.scheduled_for && (
            <span className="bg-orange-900/60 text-orange-300 border border-orange-700 px-2 py-0.5 rounded-full font-semibold">
              {fill('scheduledLabel', {
                dt: new Date(order.scheduled_for).toLocaleString(LOCALE_CODE[locale], {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                }),
              })}
            </span>
          )}
          <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
            #{order.id}
          </span>
        </div>

        {/* Delivery address */}
        {order.type === 'delivery' && order.delivery_street && (
          <div className="bg-gray-800/60 rounded-lg px-3 py-2 text-xs text-gray-300 space-y-0.5">
            <p className="font-semibold text-gray-400 mb-1">{t('deliveryAddress')}</p>
            <p>{order.delivery_street}</p>
            <p>{order.delivery_postal_code} {order.delivery_city}</p>
            {order.delivery_instructions && (
              <p className="text-gray-500 italic mt-1">{order.delivery_instructions}</p>
            )}
          </div>
        )}

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
          <p className="text-gray-600 text-xs italic border-t border-gray-700 pt-2">{t('noItemsLoaded')}</p>
        )}

        {/* Customer note */}
        {order.notes && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-3 py-2">
            <p className="text-yellow-200 text-xs font-semibold mb-0.5">{t('customerNote')}</p>
            <p className="text-yellow-100 text-sm">{order.notes}</p>
          </div>
        )}

        {/* Total + reprint */}
        <div className="border-t border-gray-700 pt-2 space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>{t('exclVat')}</span>
            <span>€{totalExcl.toFixed(2)}</span>
          </div>
          {VAT_RATES.map((r) =>
            byRate[r] > 0.005 ? (
              <div key={r} className="flex justify-between text-xs text-gray-600">
                <span>{t('vatRate').replace('{rate}', String(r))}</span>
                <span>€{byRate[r].toFixed(2)}</span>
              </div>
            ) : null
          )}
          <div className="flex justify-between text-xs text-gray-600">
            <span>{t('totalVat')}</span>
            <span>€{totalVat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm pt-1">
            <span className="text-gray-500">{t('total')}</span>
            <div className="flex items-center gap-2">
              {onReprint && (
                <button
                  onClick={() => onReprint(order)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-2 py-1 rounded-lg transition-colors border border-gray-700"
                >
                  {t('reprint')}
                </button>
              )}
              <span className="text-white font-bold">€{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {(next || canCancel) && (
          <div className="flex gap-2">
            {next && (
              <button
                onClick={advance}
                disabled={loading}
                className={`flex-1 py-2.5 rounded-lg text-white font-bold text-sm transition-colors disabled:opacity-40 ${BTN_STYLE[next]}`}
              >
                {loading ? '…' : statusLabel[next]}
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setConfirming(true)}
                disabled={loading}
                className="py-2.5 px-3 rounded-lg bg-gray-800 hover:bg-red-950 border border-transparent hover:border-red-900 text-gray-500 hover:text-red-400 text-sm transition-colors disabled:opacity-40"
              >
                {t('cancel')}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
