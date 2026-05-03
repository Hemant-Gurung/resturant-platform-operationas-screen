'use client'

import { useCallback, useEffect } from 'react'
import { useOrders } from '@/hooks/useOrders'
import { useSound } from '@/hooks/useSound'
import { usePrinter } from '@/hooks/usePrinter'
import { useSettings } from '@/components/SettingsContext'
import type { Order } from '@/types/order'

export function NotificationSubscriber() {
  const { play, unlock } = useSound()
  const { printKitchen, printCashier } = usePrinter()
  const { locale, soundEnabled } = useSettings()

  const onNewOrder = useCallback((order: Order) => {
    if (soundEnabled) play()
    printKitchen(order, locale)
    printCashier(order, locale)
  }, [play, printKitchen, printCashier, locale, soundEnabled])

  // Fires for new pending orders (new customer orders)
  useOrders(['pending', 'preparing', 'ready'] as const, onNewOrder)

  // Fires separately when an order enters the 'ready' state (alert counter staff)
  useOrders(['ready'] as const, onNewOrder)

  useEffect(() => {
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [unlock])

  return null
}
