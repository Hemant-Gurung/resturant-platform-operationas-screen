import type { CartItem } from '@/hooks/useCart'

export function OrderItemRow({
  item,
  onRemove,
}: {
  item: CartItem
  onRemove: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-dashed border-[#f0e8e0]">
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm font-semibold text-[#2d2d2d] leading-tight truncate">{item.name}</p>
        <p className="text-xs text-[#bbb] mt-0.5">x{item.quantity}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-bold text-[#2d2d2d]">
          €{(item.price * item.quantity).toFixed(2)}
        </span>
        <button
          onClick={onRemove}
          className="w-5 h-5 rounded-full bg-[#f0e8e0] text-[#bbb] hover:bg-red-100 hover:text-red-400 flex items-center justify-center text-xs font-bold transition-colors leading-none"
        >
          −
        </button>
      </div>
    </div>
  )
}
