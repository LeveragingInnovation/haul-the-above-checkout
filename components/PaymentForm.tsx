'use client'

import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/calculations'

interface PaymentFormProps {
  submissionId: string
  authTotalCents: number
}

export default function PaymentForm({ submissionId, authTotalCents }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Card input not found.')
      return
    }

    setLoading(true)

    try {
      // Create PaymentIntent on server
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      })

      const data = await res.json()

      if (!res.ok || !data.clientSecret) {
        setError(data.error || 'Failed to initialize payment. Please try again.')
        setLoading(false)
        return
      }

      // Confirm payment intent (authorize only — no capture)
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      )

      if (stripeError) {
        setError(stripeError.message || 'Payment authorization failed.')
        setLoading(false)
        return
      }

      if (paymentIntent?.status === 'requires_capture') {
        // Success — redirect to success page
        router.push(`/success?payment_intent=${paymentIntent.id}`)
      } else {
        setError(`Unexpected payment status: ${paymentIntent?.status}. Please contact us.`)
        setLoading(false)
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <h2>Payment Information</h2>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#4a5568' }}>
            Card Details
          </label>
          <div className="stripe-input-wrapper">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1a202c',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    '::placeholder': {
                      color: '#a0aec0',
                    },
                  },
                  invalid: {
                    color: '#c53030',
                  },
                },
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: '#a0aec0', marginTop: 8 }}>
            🔒 Secured by Stripe. Your card info is never stored on our servers.
          </p>
        </div>
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !stripe}
      >
        {loading ? 'Processing...' : `Authorize ${formatCurrency(authTotalCents)}`}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#a0aec0', marginTop: 12 }}>
        This is an authorization hold only — your card will not be charged until your rental is complete.
      </p>
    </form>
  )
}
