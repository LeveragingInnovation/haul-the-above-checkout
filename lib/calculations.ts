export interface RentalCalculation {
  rentalDays: number
  rentalFee: number
  holdAmount: number
  authTotal: number
  rentalFeeCents: number
  holdAmountCents: number
  authTotalCents: number
}

// Month names for manual date formatting — no Date object involved.
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Calculate rental duration and fees from two YYYY-MM-DD strings.
 * Uses Date.UTC so the arithmetic is always timezone-independent —
 * DST and browser locale can never affect the result.
 */
export function calculateRental(pickupDate: string, returnDate: string): RentalCalculation {
  const [py, pm, pd] = pickupDate.split('-').map(Number)
  const [ry, rm, rd] = returnDate.split('-').map(Number)

  const pickupUTC = Date.UTC(py, pm - 1, pd)
  const returnUTC = Date.UTC(ry, rm - 1, rd)

  const rentalDays = Math.floor((returnUTC - pickupUTC) / 86400000) + 1
  const rentalFee = rentalDays * 150
  const holdAmount = 350
  const authTotal = rentalFee + holdAmount

  return {
    rentalDays,
    rentalFee,
    holdAmount,
    authTotal,
    rentalFeeCents: rentalFee * 100,
    holdAmountCents: holdAmount * 100,
    authTotalCents: authTotal * 100,
  }
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

/**
 * Format a YYYY-MM-DD string as "Month D, YYYY" with zero Date object usage.
 * Splitting the string manually means timezone conversion is impossible.
 * "2026-07-07" → "July 7, 2026"
 */
export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`
}
