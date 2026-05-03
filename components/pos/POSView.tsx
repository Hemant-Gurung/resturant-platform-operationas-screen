'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { POSHeader } from './POSHeader'
import { MenuGrid } from './MenuGrid'
import { OrderPanel } from './OrderPanel'
import { CheckoutSheet } from './CheckoutSheet'
import type { View } from '@/components/NavTabs'

export function POSView({ onSwitch }: { onSwitch: (v: View) => void }) {
  const { items, add, remove, clear, total } = useCart()
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-[#fdf6ee] overflow-hidden">
      <POSHeader onSwitch={onSwitch} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 overflow-hidden flex flex-col gap-4 min-w-0">
          <MenuGrid cart={items} onAdd={add} />
        </div>
        <OrderPanel
          items={items}
          total={total}
          onRemove={remove}
          onConfirm={() => setConfirming(true)}
        />
      </div>

      {confirming && (
        <CheckoutSheet
          items={items}
          total={total}
          onDone={() => { clear(); setConfirming(false) }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  )
}
