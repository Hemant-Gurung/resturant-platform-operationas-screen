'use client'

import { useState } from 'react'
import { useMenuItems } from '@/hooks/useMenuItems'
import type { MenuItem } from '@/hooks/useMenuItems'
import { CategoryTabs } from './CategoryTabs'
import { MenuItemCard } from './MenuItemCard'
import type { CartItem } from '@/hooks/useCart'

export function MenuGrid({
  cart,
  onAdd,
}: {
  cart: CartItem[]
  onAdd: (item: MenuItem) => void
}) {
  const { grouped, loading } = useMenuItems()
  const [selectedCat, setSelectedCat] = useState<number | null>(null)

  const categories = grouped.map((g) => g.category)
  const items =
    selectedCat === null
      ? grouped.flatMap((g) => g.items)
      : (grouped.find((g) => g.category.id === selectedCat)?.items ?? [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[#ccc] text-sm">
        Loading menu…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <CategoryTabs
        categories={categories}
        selected={selectedCat}
        onChange={setSelectedCat}
      />
      <div className="grid grid-cols-3 gap-3 overflow-y-auto content-start" style={{ scrollbarWidth: 'none' }}>
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            quantity={cart.find((c) => c.id === item.id)?.quantity ?? 0}
            onAdd={() => onAdd(item)}
          />
        ))}
        {items.length === 0 && (
          <p className="col-span-3 text-center text-[#ccc] text-sm py-8">No items in this category</p>
        )}
      </div>
    </div>
  )
}
