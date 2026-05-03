'use client'

import { useOrders } from '@/hooks/useOrders'
import { usePrinter } from '@/hooks/usePrinter'
import { useTrans } from '@/components/LocaleContext'
import { OrderCard } from '@/components/OrderCard'
import { NavTabs } from '@/components/NavTabs'
import type { View } from '@/components/NavTabs'

export function CounterView({ current, onSwitch }: { current: View; onSwitch: (v: View) => void }) {
  const { locale } = useTrans()
  const { status: printerStatus, printKitchen, printCashier } = usePrinter()
  const { orders } = useOrders(['ready'] as const)

  return (
    <main className="min-h-screen bg-gray-950 p-4 pb-8">
      <header className="flex items-center justify-between mb-6">
        <NavTabs current={current} onSwitch={onSwitch} badge={{ counter: orders.length }} count={orders.length} />
        <div
          title={`Printer: ${printerStatus}`}
          className={`w-2 h-2 rounded-full shrink-0 ${
            printerStatus === 'connected' ? 'bg-green-500' :
            printerStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            printerStatus === 'error' ? 'bg-red-500' : 'bg-gray-600'
          }`}
        />
      </header>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-700 text-xl select-none">
          No orders ready
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onReprint={(o) => { printKitchen(o, locale); printCashier(o, locale) }} />
          ))}
        </div>
      )}
    </main>
  )
}
