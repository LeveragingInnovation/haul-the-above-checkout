'use client'

import { JotformSubmission } from '@/lib/jotform'
import { RentalCalculation, formatCurrency, formatDate } from '@/lib/calculations'

interface CheckoutSummaryProps {
  submission: JotformSubmission
  calculation: RentalCalculation
}

export default function CheckoutSummary({ submission, calculation }: CheckoutSummaryProps) {
  return (
    <>
      {/* Customer Info */}
      <div className="card">
        <h2>Rental Details</h2>
        <div className="detail-row">
          <span className="label">Customer</span>
          <span className="value">{submission.customerName}</span>
        </div>
        <div className="detail-row">
          <span className="label">Email</span>
          <span className="value">{submission.customerEmail}</span>
        </div>
        <div className="detail-row">
          <span className="label">Phone</span>
          <span className="value">{submission.customerPhone}</span>
        </div>
        <div className="detail-row">
          <span className="label">Pickup Date</span>
          <span className="value">{formatDate(submission.pickupDate)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Return Date</span>
          <span className="value">{formatDate(submission.returnDate)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Rental Duration</span>
          <span className="value">{calculation.rentalDays} day{calculation.rentalDays !== 1 ? 's' : ''}</span>
        </div>
        <div className="detail-row">
          <span className="label">Trailer ID</span>
          <span className="value">HTA-001</span>
        </div>
      </div>

      {/* Pricing */}
      <div className="card">
        <h2>Payment Summary</h2>
        <div className="pricing-row">
          <span>{calculation.rentalDays} day{calculation.rentalDays !== 1 ? 's' : ''} × $150/day</span>
          <span>{formatCurrency(calculation.rentalFeeCents)}</span>
        </div>
        <div className="pricing-row">
          <span>Refundable Damage Deposit</span>
          <span>{formatCurrency(calculation.holdAmountCents)}</span>
        </div>
        <div className="pricing-total">
          <span>Total Authorization</span>
          <span>{formatCurrency(calculation.authTotalCents)}</span>
        </div>
      </div>

      {/* Important Notice */}
      <div className="notice">
        <strong>⚠️ Important: Authorization Hold</strong>
        The $350 refundable damage deposit is an authorization hold only. It will not be charged
        unless required under the Rental Agreement. The hold will be released upon safe return
        of the trailer.
      </div>
    </>
  )
}
