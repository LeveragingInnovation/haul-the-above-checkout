import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/lib/stripe'

export async function GET(request: NextRequest) {
  // Check dashboard password via header
  const auth = request.headers.get('x-dashboard-token')
  const password = process.env.DASHBOARD_PASSWORD

  if (!password || auth !== password) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
    })

    const rentals = paymentIntents.data.map((pi) => ({
      id: pi.id,
      status: pi.status,
      amount: pi.amount,
      created: pi.created,
      customer_name: pi.metadata?.customer_name || '—',
      customer_email: pi.metadata?.customer_email || '—',
      customer_phone: pi.metadata?.customer_phone || '—',
      pickup_date: pi.metadata?.pickup_date || '—',
      return_date: pi.metadata?.return_date || '—',
      rental_days: pi.metadata?.rental_days || '—',
      rental_fee_cents: pi.metadata?.rental_fee_cents || '0',
      hold_amount_cents: pi.metadata?.hold_amount_cents || '0',
      auth_total_cents: pi.metadata?.auth_total_cents || '0',
      trailer_id: pi.metadata?.trailer_id || '—',
      jotform_submission_id: pi.metadata?.jotform_submission_id || '—',
    }))

    return NextResponse.json({ rentals })
  } catch (err: unknown) {
    console.error('Dashboard rentals error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
