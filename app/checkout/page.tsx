import { Suspense } from 'react'
import CheckoutContent from './CheckoutContent'

interface CheckoutPageProps {
  searchParams: { submissionId?: string }
}

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const submissionId = searchParams.submissionId

  return (
    <div className="container">
      <div className="header">
        <div className="logo">Haul The <span>Above</span></div>
        <div className="subtitle">Trailer Rental Checkout</div>
      </div>

      <Suspense fallback={
        <div className="loading">
          <div className="spinner" />
          <p>Loading your rental details...</p>
        </div>
      }>
        <CheckoutContent submissionId={submissionId} />
      </Suspense>
    </div>
  )
}
