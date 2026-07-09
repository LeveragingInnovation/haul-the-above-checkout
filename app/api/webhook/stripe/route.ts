import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { formatDate } from '@/lib/calculations'
// App Router: request.text() reads the raw body — no bodyParser config needed

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Resend client — initialized lazily inside handler so missing key fails gracefully
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

function formatCentsAsDollars(cents: string | undefined): string {
  if (!cents) return '$0.00'
  const num = parseInt(cents, 10)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num / 100)
}

function buildConfirmationEmail(pi: Stripe.PaymentIntent): string {
  const m = pi.metadata || {}
  const pickupFormatted = m.pickup_date ? formatDate(m.pickup_date) : m.pickup_date || '—'
  const returnFormatted = m.return_date ? formatDate(m.return_date) : m.return_date || '—'
  const rentalDays = m.rental_days || '—'
  const rentalFee = formatCentsAsDollars(m.rental_fee_cents)
  const depositHold = formatCentsAsDollars(m.hold_amount_cents)
  const totalAuth = formatCentsAsDollars(m.auth_total_cents)
  const customerName = m.customer_name || 'Renter'
  const trailerId = m.trailer_id || 'HTA-001'

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HTA Rental Booking Confirmed</title>
<style>
  body { margin: 0; padding: 0; background: #f3f3fe; font-family: Helvetica, Arial, sans-serif; }
  .wrapper { max-width: 600px; margin: 32px auto; }
  .header { background: #1a1a2e; border-radius: 8px 8px 0 0; padding: 24px 32px; }
  .header-title { color: #fff; font-size: 22px; font-weight: 800; margin: 0; }
  .header-sub { color: #a0aec0; font-size: 14px; margin: 4px 0 0; }
  .accent { color: #e74c3c; }
  .badge { display: inline-block; background: #22c55e; color: #fff; font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.5px; }
  .card { background: #fff; padding: 28px 32px; border-bottom: 1px solid #ecedf2; }
  .card:last-of-type { border-radius: 0 0 8px 8px; border-bottom: none; }
  .section-title { font-size: 12px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f5; }
  .row:last-child { border-bottom: none; }
  .label { color: #6f76a7; font-size: 14px; }
  .value { color: #1a1a2e; font-size: 14px; font-weight: 600; text-align: right; }
  .total-row { display: flex; justify-content: space-between; padding: 14px 0; }
  .total-label { font-size: 16px; font-weight: 700; color: #1a1a2e; }
  .total-value { font-size: 18px; font-weight: 800; color: #1a1a2e; }
  .paid-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin: 0 0 16px; }
  .paid-status { font-size: 15px; font-weight: 700; color: #15803d; }
  .paid-id { font-size: 12px; color: #6f76a7; margin-top: 4px; font-family: monospace; word-break: break-all; }
  .ref-box { background: #f8f8fc; border-radius: 6px; padding: 14px 18px; text-align: center; }
  .ref-label { font-size: 12px; color: #718096; margin: 0 0 4px; }
  .ref-value { font-size: 16px; font-weight: 700; color: #1a1a2e; font-family: monospace; word-break: break-all; }
  .notice { background: #fffbe8; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 0 6px 6px 0; font-size: 13px; color: #78350f; line-height: 1.6; }
  .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
  @media (max-width: 600px) {
    .wrapper { margin: 0; }
    .header, .card { padding: 20px; }
    .row { flex-direction: column; gap: 2px; }
    .value { text-align: left; }
  }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <p class="header-title">Haul The <span class="accent">Above</span></p>
    <p class="header-sub">Dump Trailer Rentals — Booking Confirmed</p>
  </div>

  <div class="card">
    <p style="font-size:15px;color:#1a1a2e;margin:0 0 16px;">Hi ${customerName},</p>
    <p style="font-size:14px;color:#4a5568;margin:0 0 16px;line-height:1.6;">
      Your payment has been authorized and your trailer rental is confirmed. Please review the details below and save this email for your records.
    </p>
    <div class="paid-banner">
      <div class="paid-status">✅ Payment Status: PAID (AUTHORIZED)</div>
      <div class="paid-id">Payment Reference: ${pi.id}</div>
    </div>
  </div>

  <div class="card">
    <p class="section-title">Rental Details</p>
    <div class="row">
      <span class="label">Trailer</span>
      <span class="value">${trailerId} — 7' x 16' Dump Trailer</span>
    </div>
    <div class="row">
      <span class="label">Pickup Date</span>
      <span class="value">${pickupFormatted}</span>
    </div>
    <div class="row">
      <span class="label">Return Date</span>
      <span class="value">${returnFormatted}</span>
    </div>
    <div class="row">
      <span class="label">Number of Rental Days</span>
      <span class="value">${rentalDays}</span>
    </div>
  </div>

  <div class="card">
    <p class="section-title">Payment Summary</p>
    <div class="row">
      <span class="label">Rental Fee (${rentalDays} day${rentalDays === '1' ? '' : 's'} × $150/day)</span>
      <span class="value">${rentalFee}</span>
    </div>
    <div class="row">
      <span class="label">Damage Deposit Hold</span>
      <span class="value">${depositHold}</span>
    </div>
    <div style="border-top:2px solid #1a1a2e;margin-top:8px;padding-top:8px;">
      <div class="total-row">
        <span class="total-label">Total Authorized</span>
        <span class="total-value">${totalAuth}</span>
      </div>
    </div>
    <p style="font-size:12px;color:#718096;margin:8px 0 0;line-height:1.5;">
      The $${depositHold} damage deposit is an <strong>authorization hold only</strong> — your card has not been charged this amount. It will be released upon safe return of the trailer.
    </p>
  </div>

  <div class="card">
    <p class="section-title">Confirmation Number</p>
    <div class="ref-box">
      <p class="ref-label">Save this for your records</p>
      <p class="ref-value">${pi.id}</p>
    </div>
  </div>

  <div class="card">
    <div class="notice">
      <strong>📋 Next Steps:</strong> Our team will review your rental agreement and contact you before your pickup date to confirm logistics. Questions? Reply to this email or reach us at <a href="mailto:support@gfsrentals.com" style="color:#92400e;">support@gfsrentals.com</a>
    </div>
  </div>

  <div class="footer">
    <p>Haul The Above — G&amp;FS Investments LLC</p>
    <p style="margin:4px 0 0;">This is an automated confirmation. Please do not reply directly to this message.</p>
  </div>
</div>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[webhook] Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // -----------------------------------------------------------------------
  // Handle: payment_intent.amount_capturable_updated
  // Fires when a manual-capture PaymentIntent is successfully authorized.
  // This is when the customer's card hold is placed — booking is confirmed.
  // -----------------------------------------------------------------------
  if (event.type === 'payment_intent.amount_capturable_updated') {
    const pi = event.data.object as Stripe.PaymentIntent

    const customerEmail = pi.metadata?.customer_email
    const customerName = pi.metadata?.customer_name || 'Renter'

    if (!customerEmail) {
      console.error(`[webhook] No customer_email in PI metadata for ${pi.id}`)
      return NextResponse.json({ received: true, warning: 'no customer email' })
    }

    try {
      const htmlBody = buildConfirmationEmail(pi)
      const resend = getResend()

      const { data, error } = await resend.emails.send({
        from: 'Haul The Above <bookings@gfsrentals.com>',
        to: [customerEmail],
        replyTo: 'support@gfsrentals.com',
        subject: `Booking Confirmed — Haul The Above Trailer Rental (${pi.metadata?.pickup_date || ''} → ${pi.metadata?.return_date || ''})`,
        html: htmlBody,
      })

      if (error) {
        console.error(`[webhook] Resend error for ${pi.id}:`, error)
      } else {
        console.log(`[webhook] Confirmation email sent to ${customerEmail} | email_id=${data?.id} | pi=${pi.id}`)
      }
    } catch (emailErr) {
      // Log but return 200 — we don't want Stripe to retry for email failures
      console.error(`[webhook] Email send failed for PI ${pi.id}:`, emailErr)
    }
  }

  return NextResponse.json({ received: true })
}
