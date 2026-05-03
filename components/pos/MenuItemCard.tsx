'use client'

import type { MenuItem } from '@/hooks/useMenuItems'

export function MenuItemCard({
  item,
  quantity,
  onAdd,
}: {
  item: MenuItem
  quantity: number
  onAdd: () => void
}) {
  return (
    <div
      onClick={onAdd}
      className={`bg-white rounded-xl border-2 p-3 cursor-pointer transition-all select-none active:scale-95 ${
        quantity > 0 ? 'border-[#ff7043] shadow-sm' : 'border-[#f0e8e0] hover:border-[#ff7043]'
      }`}
    >
      <p className="text-sm font-bold text-[#2d2d2d] leading-tight mb-3">{item.name}</p>
      {item.description && (
        <p className="text-xs text-[#bbb] leading-snug mb-2 line-clamp-1">{item.description}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#ff7043]">€{item.price.toFixed(2)}</span>
        <div className="flex items-center gap-1.5">
          {quantity > 0 && (
            <span className="text-xs bg-[#ff7043] text-white w-5 h-5 rounded-full flex items-center justify-center font-bold leading-none">
              {quantity}
            </span>
          )}
          <span className="w-6 h-6 rounded-full bg-[#ff7043] text-white flex items-center justify-center text-base font-bold leading-none">
            +
          </span>
        </div>
      </div>
    </div>
  )
}
