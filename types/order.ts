export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'

// Reflects the actual flattened Postgres columns Payload creates
export type Order = {
  id: number
  restaurant: string
  type: 'eat-in' | 'takeaway'
  status: OrderStatus
  customer_name: string
  customer_phone: string
  customer_email?: string | null
  orders_items?: { name: string; price: number; quantity: number; id?: string | null }[] | null
  total: number
  table_number?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}
