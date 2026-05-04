'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { kitchenTicket, cashierReceipt } from '@/lib/escpos'
import type { Order } from '@/types/order'
import type { Locale } from '@/lib/i18n'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    qz: any
  }
}

type PrinterStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

const PRINTER_NAME = process.env.NEXT_PUBLIC_PRINTER_NAME!
const RESTAURANT_NAME = process.env.NEXT_PUBLIC_RESTAURANT_NAME ?? process.env.NEXT_PUBLIC_RESTAURANT ?? 'Restaurant'

function loadQzScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.qz) return resolve()
    const script = document.createElement('script')
    script.src = '/qz-tray.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load QZ Tray script'))
    document.head.appendChild(script)
  })
}

export function usePrinter() {
  const [status, setStatus] = useState<PrinterStatus>('disconnected')
  const configRef = useRef<unknown>(null)

  useEffect(() => {
    let cancelled = false

    async function connect() {
      setStatus('connecting')
      try {
        await loadQzScript()
        const qz = window.qz

        qz.security.setCertificatePromise((resolve: (v: string) => void) => resolve(''))
        qz.security.setSignatureAlgorithm('SHA512')
        qz.security.setSignaturePromise(() => (resolve: (v: string) => void) => resolve(''))

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
    return () => {
      cancelled = true
      if (window.qz?.websocket.isActive()) {
        window.qz.websocket.disconnect()
      }
    }
  }, [])

  const print = useCallback(async (data: string) => {
    const qz = window.qz
    if (!qz) return
    if (!qz.websocket.isActive()) {
      try {
        await qz.websocket.connect()
        configRef.current = qz.configs.create(PRINTER_NAME)
        setStatus('connected')
      } catch {
        setStatus('error')
        return
      }
    }
    if (!configRef.current) return
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
