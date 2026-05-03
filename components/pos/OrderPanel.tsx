'use client'

import { groupedVat, VAT_RATES } from '@/lib/vat'
import { useTrans } from '@/components/LocaleContext'
import type { CartItem } from '@/hooks/useCart'
import { OrderItemRow } from './OrderItemRow'

export function OrderPanel({
  items,
  total,
  onRemove,
  onConfirm,
}: {
  items: CartItem[]
  total: number
  onRemove: (id: number) => void
  onConfirm: () => void
}) {
  const { t } = useTrans()
  const { byRate, totalVat, totalExcl } = groupedVat(items)

  return (
    <div className="w-56 bg-white border-l-2 border-[#f0e8e0] flex flex-col p-4 shrink-0">
      <div className="shrink-0 mb-3">
        <p className="font-mono font-bold text-[#2d2d2d] text-sm tracking-wide">{t('orderTitle')}</p>
        <p className="text-xs text-[#aaa] mt-0.5">{t('newOrder')}</p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'none' }}>
        {items.length === 0 ? (
          <p className="text-xs text-[#ccc] text-center pt-6">{t('addItems')}</p>
        ) : (
          items.map((item) => (
            <OrderItemRow key={item.id} item={item} onRemove={() => onRemove(item.id)} />
          ))
        )}
      </div>

      <div className="shrink-0 pt-3 border-t-2 border-[#ffe0d6] mt-3">
        <div className="flex justify-between text-xs text-[#aaa] mb-1.5">
          <span>{t('exclVat')}</span>
          <span>€{totalExcl.toFixed(2)}</span>
        </div>
        {VAT_RATES.map((r) =>
          byRate[r] > 0.005 ? (
            <div key={r} className="flex justify-between text-xs text-[#aaa] mb-1.5">
              <span>{t('vatRate').replace('{rate}', String(r))}</span>
              <span>€{byRate[r].toFixed(2)}</span>
            </div>
          ) : null
        )}
        <div className="flex justify-between text-xs text-[#aaa] mb-3">
          <span>{t('totalVat')}</span>
          <span>€{totalVat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-baseline mb-4">
          <span className="font-mono font-bold text-[#2d2d2d] text-sm">{t('total')}</span>
          <span className="font-mono font-bold text-lg text-[#2d2d2d]">€{total.toFixed(2)}</span>
        </div>
        <button
          onClick={onConfirm}
          disabled={items.length === 0}
          className="w-full py-3 bg-[#ff7043] hover:bg-[#f4511e] active:bg-[#e64a19] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors"
        >
          {t('confirmOrderBtn')}
        </button>
      </div>
    </div>
  )
}
