'use client'

import { useState } from 'react'
import type { VatRate } from '@/lib/vat'
import type { MenuItem } from '@/hooks/useMenuItems'

export type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  vatRate: VatRate
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  function add(item: MenuItem) {
    setItems((prev) => {
      const exists = prev.find((c) => c.id === item.id)
      if (exists) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, vatRate: item.vat_rate }]
    })
  }

  function remove(id: number) {
    setItems((prev) => {
      const item = prev.find((c) => c.id === id)
      if (!item) return prev
      if (item.quantity === 1) return prev.filter((c) => c.id !== id)
      return prev.map((c) => c.id === id ? { ...c, quantity: c.quantity - 1 } : c)
    })
  }

  function clear() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return { items, add, remove, clear, total }
}
