'use client'

import { useState, useEffect } from 'react'

interface Rental {
  id: string
  status: string
  amount: number
  created: number
  customer_name: string
  customer_email: string
  customer_phone: string
  pickup_date: string
  return_date: string
  rental_days: string
  rental_fee_cents: string
  hold_amount_cents: string
  auth_total_cents: string
  trailer_id: string
  jotform_submission_id: string
}

function formatAmount(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function StatusTag({ status }: { status: string }) {
  if (status === 'requires_capture') {
    return <span className="tag tag-yellow">Authorized</span>
  }
  if (status === 'succeeded') {
    return <span className="tag tag-green">Captured</span>
  }
  if (status === 'canceled') {
    return <span className="tag tag-red">Canceled</span>
  }
  return <span className="tag tag-gray">{status}</span>
}

export default function DashboardClient() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/dashboard/rentals', {
        headers: { 'x-dashboard-token': password },
      })

      if (res.status === 401) {
        setLoginError('Incorrect password. Please try again.')
        setLoading(false)
        return
      }

      if (!res.ok) {
        setLoginError('Server error. Please try again.')
        setLoading(false)
        return
      }

      const data = await res.json()
      setRentals(data.rentals || [])
      setAuthed(true)
    } catch {
      setLoginError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchRentals = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/rentals', {
        headers: { 'x-dashboard-token': password },
      })
      const data = await res.json()
      if (res.ok) {
        setRentals(data.rentals || [])
      } else {
        setError(data.error || 'Failed to load rentals')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (!authed) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h1>🔐 Dashboard</h1>
          <p>Haul The Above — Rental Management</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter dashboard password"
                required
                autoFocus
              />
            </div>
            {loginError && (
              <div className="error-msg" style={{ marginBottom: 16 }}>
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const requiresCapture = rentals.filter(r => r.status === 'requires_capture').length
  const totalAuthorized = rentals
    .filter(r => r.status === 'requires_capture')
    .reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="container" style={{ maxWidth: 1200 }}>
      <div className="dashboard-header">
        <div>
          <div className="logo" style={{ fontSize: 22 }}>Haul The <span style={{ color: '#e94560' }}>Above</span> — Dashboard</div>
          <div style={{ color: '#718096', fontSize: 14 }}>Rental Management Portal</div>
        </div>
        <button
          onClick={fetchRentals}
          className="btn btn-primary"
          style={{ width: 'auto', padding: '10px 20px', fontSize: 14 }}
          disabled={loading}
        >
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{rentals.length}</div>
          <div className="stat-label">Total Rentals</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{requiresCapture}</div>
          <div className="stat-label">Awaiting Capture</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatAmount(totalAuthorized)}</div>
          <div className="stat-label">Authorized (Pending)</div>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Pickup</th>
                <th>Return</th>
                <th>Days</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment ID</th>
              </tr>
            </thead>
            <tbody>
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                    No rentals found
                  </td>
                </tr>
              ) : (
                rentals.map((rental) => (
                  <tr key={rental.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rental.customer_name}</div>
                      <div style={{ fontSize: 12, color: '#718096' }}>{rental.customer_email}</div>
                    </td>
                    <td>{rental.pickup_date}</td>
                    <td>{rental.return_date}</td>
                    <td style={{ textAlign: 'center' }}>{rental.rental_days}</td>
                    <td style={{ fontWeight: 600 }}>{formatAmount(rental.amount)}</td>
                    <td><StatusTag status={rental.status} /></td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#718096' }}>
                        {rental.id.slice(0, 18)}...
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, color: '#718096', fontSize: 12 }}>
        Stripe TEST mode — no real payments processed
      </div>
    </div>
  )
}
