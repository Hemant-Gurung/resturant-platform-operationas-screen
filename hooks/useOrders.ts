'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/types/order'

// e.g. "09:00" — scheduled orders only appear at or after this time on their day
const OPENING_TIME = process.env.NEXT_PUBLIC_OPENING_TIME ?? '09:00'

function isVisible(order: Order): boolean {
  if (!order.scheduled_for) return true

  const now = new Date()
  const scheduled = new Date(order.scheduled_for)
  const scheduledDay = scheduled.toDateString()
  const today = now.toDateString()

  // Past days — always show
  if (scheduledDay !== today && scheduled < now) return true

  // Future days — hide
  if (scheduledDay !== today && scheduled > now) return false

  // Today — show only at or after opening time
  const [h, m] = OPENING_TIME.split(':').map(Number)
  const opening = new Date()
  opening.setHours(h, m, 0, 0)
  return now >= opening
}

export function useOrders(statuses: OrderStatus[], onNewOrder?: (order: Order) => void) {
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [now, setNow] = useState(() => new Date())
  const onNewOrderRef = useRef(onNewOrder)
  const notifiedIds = useRef(new Set<number>())
  const channelId = useRef(`orders-${Math.random().toString(36).slice(2)}`)
  const statusKey = statuses.join(',')

  useEffect(() => {
    onNewOrderRef.current = onNewOrder
  }, [onNewOrder])

  // Re-check visibility every minute so scheduled orders appear automatically
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, orders_items(*)')
      .eq('restaurant', process.env.NEXT_PUBLIC_RESTAURANT!)
      .in('status', statuses)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) {
          const orders = data as Order[]
          // Pre-mark visible initial orders so we don't re-print them on page load.
          // Scheduled orders not yet visible will be notified when they become visible.
          orders.filter(isVisible).forEach((o) => notifiedIds.current.add(o.id))
          setAllOrders(orders)
        }
      })

    const channel = supabase
      .channel(channelId.current)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant=eq.${process.env.NEXT_PUBLIC_RESTAURANT}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const order = payload.new as Order
            if (statuses.includes(order.status)) {
              supabase
                .from('orders')
                .select('*, orders_items(*)')
                .eq('id', order.id)
                .single()
                .then(({ data }) => {
                  if (data) setAllOrders((prev) => [...prev, data as Order])
                })
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Order
            supabase
              .from('orders')
              .select('*, orders_items(*)')
              .eq('id', updated.id)
              .single()
              .then(({ data }) => {
                if (!data) return
                const full = data as Order
                setAllOrders((prev) => {
                  if (statuses.includes(full.status)) {
                    const exists = prev.find((o) => o.id === full.id)
                    return exists
                      ? prev.map((o) => (o.id === full.id ? full : o))
                      : [...prev, full]
                  }
                  return prev.filter((o) => o.id !== full.id)
                })
              })
          } else if (payload.eventType === 'DELETE') {
            setAllOrders((prev) => prev.filter((o) => o.id !== (payload.old as Order).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusKey])

  // Notify (sound + print) for orders that just became visible.
  // Runs on new arrivals AND on each minute tick, so scheduled orders
  // are notified exactly when they cross opening time.
  useEffect(() => {
    for (const order of allOrders) {
      if (isVisible(order) && !notifiedIds.current.has(order.id)) {
        notifiedIds.current.add(order.id)
        onNewOrderRef.current?.(order)
      }
    }
  }, [allOrders, now])

  const orders = allOrders.filter(isVisible)

  return { orders }
}
