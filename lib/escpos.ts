import type { Order } from '@/types/order'
import { groupedVat, VAT_RATES } from '@/lib/vat'
import { t, fill, LOCALE_CODE, type Locale } from '@/lib/i18n'

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

export function kitchenTicket(order: Order, locale: Locale = 'en'): string {
  const items = order.orders_items ?? []
  const type =
    order.type === 'eat-in'
      ? fill(t('printDineIn', locale), { n: order.table_number ?? '?' })
      : order.type === 'delivery'
      ? t('printDelivery', locale)
      : t('printTakeaway', locale)

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
    lines.push(BOLD_ON + t('printNote', locale) + BOLD_OFF + FEED)
    lines.push(order.notes + FEED)
    lines.push(divider() + FEED)
  }

  if (order.type === 'delivery' && order.delivery_street) {
    lines.push(BOLD_ON + t('printDeliverTo', locale) + BOLD_OFF + FEED)
    lines.push(order.delivery_street + FEED)
    lines.push(`${order.delivery_postal_code ?? ''} ${order.delivery_city ?? ''}`.trim() + FEED)
    if (order.delivery_instructions) {
      lines.push(order.delivery_instructions + FEED)
    }
    lines.push(divider() + FEED)
  }

  if (order.pickup_time) {
    lines.push(
      BOLD_ON + fill(t('printPickup', locale), { time: order.pickup_time }) + BOLD_OFF + FEED
    )
  }

  if (order.scheduled_for) {
    const dt = new Date(order.scheduled_for).toLocaleString(LOCALE_CODE[locale], {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    })
    lines.push(
      BOLD_ON + fill(t('printScheduled', locale), { dt }) + BOLD_OFF + FEED
    )
  }

  lines.push(FEED + FEED + FEED + CUT)

  return lines.join('')
}

export function cashierReceipt(order: Order, restaurantName: string, locale: Locale = 'en'): string {
  const items = order.orders_items ?? []
  const now = new Date().toLocaleString(LOCALE_CODE[locale], {
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
    ...(() => {
      const lines = (order.orders_items ?? []).map((i) => ({
        price: i.price,
        quantity: i.quantity,
        vatRate: (i.vat_rate ?? 12) as 6 | 12 | 21,
      }))
      const { byRate, totalExcl } = groupedVat(lines)
      return [
        pad(t('printExclVat', locale), `€${totalExcl.toFixed(2)}`) + FEED,
        ...VAT_RATES.filter((r) => byRate[r] > 0.005).map(
          (r) =>
            pad(fill(t('printVatRate', locale), { rate: r }), `€${byRate[r].toFixed(2)}`) + FEED
        ),
        divider() + FEED,
        BOLD_ON + pad(t('printTotal', locale), `€${order.total.toFixed(2)}`) + BOLD_OFF + FEED,
        divider() + FEED,
      ]
    })(),
    ALIGN_CENTER,
    FEED + t('printThankYou', locale) + FEED,
    FEED + FEED + FEED + CUT,
  ]

  return lines.join('')
}
