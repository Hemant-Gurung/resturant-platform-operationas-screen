'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { kitchenTicket, cashierReceipt } from '@/lib/escpos'
import type { Order } from '@/types/order'

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
    script.src = 'https://cdn.qz.io/qz-tray/2.2.4/qz-tray.js'
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

        // Allow unsigned requests — requires QZ Tray to have certificate checking disabled
        qz.security.setCertificatePromise(() => Promise.resolve())
        qz.security.setSignatureAlgorithm('SHA512')
        qz.security.setSignaturePromise(() => Promise.resolve())

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
    if (!window.qz?.websocket.isActive() || !configRef.current) return
    await window.qz.print(configRef.current, [
      { type: 'raw', format: 'command', flavor: 'plain', data },
    ])
  }, [])

  const printKitchen = useCallback(
    (order: Order) => print(kitchenTicket(order)),
    [print]
  )

  const printCashier = useCallback(
    (order: Order) => print(cashierReceipt(order, RESTAURANT_NAME)),
    [print]
  )

  return { status, printKitchen, printCashier }
}
