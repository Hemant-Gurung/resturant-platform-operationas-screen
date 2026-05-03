'use client'

import type { MenuCategory } from '@/hooks/useMenuItems'

export function CategoryTabs({
  categories,
  selected,
  onChange,
}: {
  categories: MenuCategory[]
  selected: number | null
  onChange: (id: number | null) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 shrink-0" style={{ scrollbarWidth: 'none' }}>
      <button
        onClick={() => onChange(null)}
        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors ${
          selected === null
            ? 'bg-[#ff7043] border-[#ff7043] text-white'
            : 'bg-white border-[#e0d6cc] text-[#999] hover:border-[#ff7043] hover:text-[#ff7043]'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors ${
            selected === cat.id
              ? 'bg-[#ff7043] border-[#ff7043] text-white'
              : 'bg-white border-[#e0d6cc] text-[#999] hover:border-[#ff7043] hover:text-[#ff7043]'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
