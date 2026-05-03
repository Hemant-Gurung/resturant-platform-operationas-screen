export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'

// Reflects the actual flattened Postgres columns Payload creates
export type Order = {
  id: number
  restaurant: string
  type: 'eat-in' | 'takeaway' | 'delivery'
  status: OrderStatus
  customer_name: string
  customer_phone: string
  customer_email?: string | null
  orders_items?: { name: string; price: number; quantity: number; vat_rate?: number | null; id?: string | null }[] | null
  total: number
  table_number?: string | null
  pickup_time?: string | null
  delivery_street?: string | null
  delivery_city?: string | null
  delivery_postal_code?: string | null
  delivery_instructions?: string | null
  scheduled_for?: string | null
  payment_method?: 'cash' | 'card' | null
  notes?: string | null
  created_at: string
  updated_at: string
}
