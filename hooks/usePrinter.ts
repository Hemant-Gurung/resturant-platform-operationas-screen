'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { kitchenTicket, cashierReceipt } from '@/lib/escpos'
import type { Order } from '@/types/order'
import type { Locale } from '@/lib/i18n'
import type qzTray from 'qz-tray'

type PrinterStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

const PRINTER_NAME = process.env.NEXT_PUBLIC_PRINTER_NAME!
const RESTAURANT_NAME = process.env.NEXT_PUBLIC_RESTAURANT_NAME ?? process.env.NEXT_PUBLIC_RESTAURANT ?? 'Restaurant'

export function usePrinter() {
  const [status, setStatus] = useState<PrinterStatus>('disconnected')
  const qzRef = useRef<typeof qzTray | null>(null)
  const configRef = useRef<unknown>(null)

  useEffect(() => {
    let cancelled = false

    async function connect() {
      setStatus('connecting')
      try {
        const qz = (await import('qz-tray')).default
        qzRef.current = qz

        qz.security.setCertificatePromise(() => Promise.resolve(''))
        qz.security.setSignatureAlgorithm('SHA512')
        qz.security.setSignaturePromise(() => Promise.resolve(''))

        if (!qz.websocket.isActive()) {
          await qz.websocket.connect()
        }

        configRef.current = qz.configs.create(PRINTER_NAME)

        if (!cancelled) setStatus('connected')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    connect()
    return () => { cancelled = true }
  }, [])

  const print = useCallback(async (data: string) => {
    const qz = qzRef.current
    if (!qz?.websocket.isActive() || !configRef.current) return
    await qz.print(configRef.current, [
      { type: 'raw', format: 'command', flavor: 'plain', data },
    ])
  }, [])

  const printKitchen = useCallback(
    (order: Order, locale: Locale = 'en') => print(kitchenTicket(order, locale)),
    [print]
  )

  const printCashier = useCallback(
    (order: Order, locale: Locale = 'en') => print(cashierReceipt(order, RESTAURANT_NAME, locale)),
    [print]
  )

  return { status, printKitchen, printCashier }
}
