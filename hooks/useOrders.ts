'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/types/order'

export function useOrders(statuses: OrderStatus[], onNewOrder?: () => void) {
  const [orders, setOrders] = useState<Order[]>([])
  const onNewOrderRef = useRef(onNewOrder)
  const channelId = useRef(`orders-${Math.random().toString(36).slice(2)}`)
  const statusKey = statuses.join(',')

  useEffect(() => {
    onNewOrderRef.current = onNewOrder
  }, [onNewOrder])

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, orders_items(*)')
      .eq('restaurant', process.env.NEXT_PUBLIC_RESTAURANT!)
      .in('status', statuses)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setOrders(data as Order[])
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
                  if (data) {
                    setOrders((prev) => [...prev, data as Order])
                    onNewOrderRef.current?.()
                  }
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
                setOrders((prev) => {
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
            setOrders((prev) => prev.filter((o) => o.id !== (payload.old as Order).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { orders }
}
