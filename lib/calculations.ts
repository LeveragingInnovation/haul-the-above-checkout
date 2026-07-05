export interface RentalCalculation {
  rentalDays: number
  rentalFee: number
  holdAmount: number
  authTotal: number
  rentalFeeCents: number
  holdAmountCents: number
  authTotalCents: number
}

export function calculateRental(pickupDate: Date, returnDate: Date): RentalCalculation {
  const rentalDays = Math.floor((returnDate.getTime() - pickupDate.getTime()) / 86400000) + 1
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

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
