export type VatRate = 6 | 12 | 21

export const VAT_RATES: VatRate[] = [6, 12, 21]

export function extractVat(priceInclVat: number, rate: VatRate | number): number {
  return priceInclVat * rate / (100 + rate)
}

export type VatLine = { price: number; quantity: number; vatRate: VatRate }

export function groupedVat(lines: VatLine[]) {
  const byRate: Record<number, number> = { 6: 0, 12: 0, 21: 0 }
  let total = 0

  for (const { price, quantity, vatRate } of lines) {
    const lineTotal = price * quantity
    byRate[vatRate] = (byRate[vatRate] ?? 0) + extractVat(lineTotal, vatRate)
    total += lineTotal
  }

  const totalVat = VAT_RATES.reduce((s, r) => s + byRate[r], 0)

  return {
    byRate,
    totalVat,
    totalExcl: total - totalVat,
    total,
  }
}
