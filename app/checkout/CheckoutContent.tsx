import { fetchJotformSubmission } from '@/lib/jotform'
import { calculateRental } from '@/lib/calculations'
import CheckoutClient from './CheckoutClient'

interface CheckoutContentProps {
  submissionId?: string
}

export default async function CheckoutContent({ submissionId }: CheckoutContentProps) {
  if (!submissionId) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 28px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <h2 style={{ borderBottom: 'none', marginBottom: 8 }}>Invalid Link</h2>
        <p style={{ color: '#718096' }}>
          This checkout link is missing required information. Please return to the rental form
          and complete your submission again, or contact us for assistance.
        </p>
      </div>
    )
  }

  try {
    const submission = await fetchJotformSubmission(submissionId)
    const calculation = calculateRental(submission.pickupDate, submission.returnDate)

    return (
      <CheckoutClient
        submission={submission}
        calculation={calculation}
      />
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 28px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ borderBottom: 'none', marginBottom: 8 }}>Unable to Load Rental</h2>
        <p style={{ color: '#718096', marginBottom: 8 }}>
          We could not retrieve your rental details. This may be a temporary issue.
        </p>
        <p style={{ color: '#fc8181', fontSize: 13, fontFamily: 'monospace' }}>
          {message}
        </p>
      </div>
    )
  }
}
