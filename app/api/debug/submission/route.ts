/**
 * Debug endpoint: traces the full date pipeline for a given submission ID.
 * GET /api/debug/submission?id=<submissionId>
 * Protected by DASHBOARD_PASSWORD header.
 */
import { NextRequest, NextResponse } from 'next/server'
import { calculateRental, formatDate } from '@/lib/calculations'

export async function GET(request: NextRequest) {
  const auth = request.headers.get('x-dashboard-token')
  const password = process.env.DASHBOARD_PASSWORD
  if (!password || auth !== password) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const submissionId = request.nextUrl.searchParams.get('id')
  if (!submissionId) {
    return NextResponse.json({ error: 'id param required' }, { status: 400 })
  }

  const apiKey = process.env.JOTFORM_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'JOTFORM_API_KEY not set' }, { status: 500 })
  }

  // Step 1: raw Jotform API response
  const jotformUrl = `https://api.jotform.com/submission/${submissionId}?apiKey=${apiKey}`
  const jotformRes = await fetch(jotformUrl, { cache: 'no-store' })
  const jotformRaw = await jotformRes.json()

  const answers = jotformRaw?.content?.answers || {}
  const pickupAnswer = answers['11']?.answer || null
  const returnAnswer = answers['12']?.answer || null

  // Step 2: parse to YYYY-MM-DD strings (same logic as jotform.ts)
  function parseField(field: Record<string, string> | null): string {
    if (!field) return 'MISSING'
    const month = parseInt(field.month || '1', 10)
    const day = parseInt(field.day || '1', 10)
    const year = parseInt(field.year || '2026', 10)
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const pickupDateStr = parseField(pickupAnswer)
  const returnDateStr = parseField(returnAnswer)

  // Step 3: calculation
  const calc = calculateRental(pickupDateStr, returnDateStr)

  // Step 4: display formatting
  const pickupDisplay = formatDate(pickupDateStr)
  const returnDisplay = formatDate(returnDateStr)

  return NextResponse.json({
    submissionId,
    pipeline: {
      step1_jotform_raw: {
        pickup_answer: pickupAnswer,
        return_answer: returnAnswer,
      },
      step2_parsed_strings: {
        pickupDate: pickupDateStr,
        returnDate: returnDateStr,
      },
      step3_calculation: {
        rentalDays: calc.rentalDays,
        rentalFee: calc.rentalFee,
        holdAmount: calc.holdAmount,
        authTotal: calc.authTotal,
      },
      step4_display: {
        pickupDisplay,
        returnDisplay,
      },
      step5_stripe_metadata_would_be: {
        pickup_date: pickupDateStr,
        return_date: returnDateStr,
        rental_days: String(calc.rentalDays),
      },
    },
  })
}
