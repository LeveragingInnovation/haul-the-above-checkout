'use client'

import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutSummary from '@/components/CheckoutSummary'
import PaymentForm from '@/components/PaymentForm'
import { JotformSubmission } from '@/lib/jotform'
import { RentalCalculation } from '@/lib/calculations'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutClientProps {
  submission: JotformSubmission
  calculation: RentalCalculation
}

export default function CheckoutClient({ submission, calculation }: CheckoutClientProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutSummary submission={submission} calculation={calculation} />
      <PaymentForm
        submissionId={submission.submissionId}
        authTotalCents={calculation.authTotalCents}
      />
    </Elements>
  )
}
