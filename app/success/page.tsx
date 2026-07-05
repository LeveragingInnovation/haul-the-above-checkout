import stripe from '@/lib/stripe'
import { formatCurrency } from '@/lib/calculations'

interface SuccessPageProps {
  searchParams: { payment_intent?: string }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const paymentIntentId = searchParams.payment_intent

  let pi = null
  let error = null

  if (paymentIntentId) {
    try {
      pi = await stripe.paymentIntents.retrieve(paymentIntentId)
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to load confirmation'
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div className="logo">Haul The <span>Above</span></div>
        <div className="subtitle">Reservation Confirmed</div>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <div className="success-icon">✅</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          Payment Authorized!
        </h1>
        <p style={{ color: '#718096', lineHeight: 1.6 }}>
          Your rental agreement has been received and your payment has been authorized.
          You&apos;ll receive a confirmation email shortly.
        </p>
      </div>

      {error && (
        <div className="error-msg">{error}</div>
      )}

      {pi && (
        <>
          <div className="card">
            <h2>Confirmation Details</h2>
            <div className="detail-row">
              <span className="label">Status</span>
              <span className="value">
                <span className="tag tag-green">Authorized ✓</span>
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Customer</span>
              <span className="value">{pi.metadata?.customer_name || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Pickup Date</span>
              <span className="value">{pi.metadata?.pickup_date || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Return Date</span>
              <span className="value">{pi.metadata?.return_date || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Rental Days</span>
              <span className="value">{pi.metadata?.rental_days || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Rental Fee</span>
              <span className="value">
                {pi.metadata?.rental_fee_cents
                  ? formatCurrency(parseInt(pi.metadata.rental_fee_cents))
                  : '—'}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Damage Deposit Hold</span>
              <span className="value">
                {pi.metadata?.hold_amount_cents
                  ? formatCurrency(parseInt(pi.metadata.hold_amount_cents))
                  : '—'}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Total Authorized</span>
              <span className="value" style={{ fontSize: 18, color: '#1a1a2e' }}>
                {formatCurrency(pi.amount)}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Trailer ID</span>
              <span className="value">{pi.metadata?.trailer_id || '—'}</span>
            </div>
          </div>

          <div className="card">
            <h2>Confirmation Number</h2>
            <p style={{ fontSize: 14, color: '#718096' }}>Save this for your records</p>
            <div className="confirmation-number">{pi.id}</div>
          </div>
        </>
      )}

      <div className="notice">
        <strong>📋 Next Steps</strong>
        Our team will review your rental agreement and be in touch before your pickup date.
        The $350 damage deposit is an authorization hold only — it will be released upon
        safe return of the trailer. Questions? Contact us directly.
      </div>
    </div>
  )
}
