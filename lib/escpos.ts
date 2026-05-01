import type { Order } from '@/types/order'

const ESC = '\x1B'
const GS = '\x1D'
const INIT = ESC + '@'
const BOLD_ON = ESC + 'E\x01'
const BOLD_OFF = ESC + 'E\x00'
const ALIGN_CENTER = ESC + 'a\x01'
const ALIGN_LEFT = ESC + 'a\x00'
const DOUBLE_HEIGHT = ESC + '!\x10'
const NORMAL = ESC + '!\x00'
const FEED = '\x0A'
const CUT = GS + 'V\x41\x03'

const W = 42

function pad(left: string, right: string, width = W): string {
  const gap = width - left.length - right.length
  return left + ' '.repeat(Math.max(1, gap)) + right
}

function divider() {
  return '-'.repeat(W)
}

export function kitchenTicket(order: Order): string {
  const items = order.orders_items ?? []
  const type =
    order.type === 'eat-in'
      ? `Dine-in — Table ${order.table_number ?? '?'}`
      : order.type === 'delivery'
      ? 'Delivery'
      : 'Takeaway'

  const lines: string[] = [
    INIT,
    ALIGN_CENTER,
    BOLD_ON + DOUBLE_HEIGHT,
    `ORDER #${order.id}` + FEED,
    NORMAL + BOLD_OFF,
    FEED,
    ALIGN_LEFT,
    BOLD_ON + type + BOLD_OFF + FEED,
    divider() + FEED,
    ...items.map((i) => `${i.quantity}x  ${i.name}` + FEED),
    divider() + FEED,
  ]

  if (order.notes) {
    lines.push(BOLD_ON + 'NOTE:' + BOLD_OFF + FEED)
    lines.push(order.notes + FEED)
    lines.push(divider() + FEED)
  }

  if (order.type === 'delivery' && order.delivery_street) {
    lines.push(BOLD_ON + 'DELIVER TO:' + BOLD_OFF + FEED)
    lines.push(order.delivery_street + FEED)
    lines.push(`${order.delivery_postal_code ?? ''} ${order.delivery_city ?? ''}`.trim() + FEED)
    if (order.delivery_instructions) {
      lines.push(order.delivery_instructions + FEED)
    }
    lines.push(divider() + FEED)
  }

  if (order.pickup_time) {
    lines.push(BOLD_ON + `Pickup: ${order.pickup_time}` + BOLD_OFF + FEED)
  }

  if (order.scheduled_for) {
    const scheduled = new Date(order.scheduled_for).toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    })
    lines.push(BOLD_ON + `SCHEDULED: ${scheduled}` + BOLD_OFF + FEED)
  }

  lines.push(FEED + FEED + FEED + CUT)

  return lines.join('')
}

export function cashierReceipt(order: Order, restaurantName: string): string {
  const items = order.orders_items ?? []
  const now = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const lines: string[] = [
    INIT,
    ALIGN_CENTER,
    BOLD_ON + DOUBLE_HEIGHT,
    restaurantName + FEED,
    NORMAL + BOLD_OFF,
    FEED,
    `ORDER #${order.id}` + FEED,
    now + FEED,
    FEED,
    ALIGN_LEFT,
    divider() + FEED,
    ...items.map((i) =>
      pad(`${i.quantity}x  ${i.name}`, `€${(i.price * i.quantity).toFixed(2)}`) + FEED
    ),
    divider() + FEED,
    BOLD_ON + pad('TOTAL', `€${order.total.toFixed(2)}`) + BOLD_OFF + FEED,
    divider() + FEED,
    ALIGN_CENTER,
    FEED + 'Thank you!' + FEED,
    FEED + FEED + FEED + CUT,
  ]

  return lines.join('')
}
