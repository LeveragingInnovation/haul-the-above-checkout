import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/lib/stripe'
import { fetchJotformSubmission } from '@/lib/jotform'
import { calculateRental } from '@/lib/calculations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { submissionId } = body

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 })
    }

    // Fetch Jotform submission
    const submission = await fetchJotformSubmission(submissionId)

    // Calculate rental fees
    const calc = calculateRental(submission.pickupDate, submission.returnDate)

    const pickupStr = submission.pickupDate.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
    const returnStr = submission.returnDate.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })

    // Create Stripe PaymentIntent with manual capture
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calc.authTotalCents,
      currency: 'usd',
      capture_method: 'manual',
      payment_method_types: ['card'],
      description: `Haul The Above - Trailer Rental ${pickupStr} to ${returnStr}`,
      metadata: {
        jotform_submission_id: submissionId,
        customer_name: submission.customerName,
        customer_email: submission.customerEmail,
        customer_phone: submission.customerPhone,
        pickup_date: pickupStr,
        return_date: returnStr,
        rental_days: String(calc.rentalDays),
        rental_fee_cents: String(calc.rentalFeeCents),
        hold_amount_cents: String(calc.holdAmountCents),
        auth_total_cents: String(calc.authTotalCents),
        trailer_id: 'HTA-001',
      },
      receipt_email: submission.customerEmail || undefined,
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err: unknown) {
    console.error('Checkout create error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
