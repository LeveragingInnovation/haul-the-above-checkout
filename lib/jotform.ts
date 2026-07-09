export interface JotformSubmission {
  submissionId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  pickupDate: string  // YYYY-MM-DD — always a plain string, never a Date object
  returnDate: string  // YYYY-MM-DD — always a plain string, never a Date object
}

interface DateTimeField {
  day?: string
  month?: string
  year?: string
  hour?: string
  min?: string
  datetime?: string
}

/**
 * Parse a Jotform datetime answer into a YYYY-MM-DD string.
 * Jotform returns: { day: "07", month: "07", year: "2026", hour: "07", min: "00", datetime: "2026-07-07 07:00:00" }
 * We read day/month/year directly — no Date object, no timezone conversion possible.
 */
function parseJotformDate(field: DateTimeField): string {
  const month = parseInt(field.month || '1', 10)
  const day = parseInt(field.day || '1', 10)
  const year = parseInt(field.year || '2026', 10)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Test fixtures — keyed by submission ID
const TEST_SUBMISSIONS: Record<string, JotformSubmission> = {
  'test-1day': {
    submissionId: 'test-1day',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '(555) 555-5555',
    pickupDate: '2026-07-06',
    returnDate: '2026-07-06',
  },
  'test-2day': {
    submissionId: 'test-2day',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '(555) 555-5555',
    pickupDate: '2026-07-06',
    returnDate: '2026-07-07',
  },
  'test-8day': {
    submissionId: 'test-8day',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '(555) 555-5555',
    pickupDate: '2026-07-06',
    returnDate: '2026-07-13',
  },
  'test-4day': {
    submissionId: 'test-4day',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '(555) 555-5555',
    pickupDate: '2026-07-07',
    returnDate: '2026-07-10',
  },
}

export async function fetchJotformSubmission(submissionId: string): Promise<JotformSubmission> {
  // Return test fixture if test ID
  if (TEST_SUBMISSIONS[submissionId]) {
    return TEST_SUBMISSIONS[submissionId]
  }

  const apiKey = process.env.JOTFORM_API_KEY
  if (!apiKey) {
    throw new Error('JOTFORM_API_KEY is not set')
  }

  const response = await fetch(
    `https://api.jotform.com/submission/${submissionId}?apiKey=${apiKey}`,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    throw new Error(`Jotform API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (data.responseCode !== 200) {
    throw new Error(`Jotform error: ${data.message}`)
  }

  const answers = data.content?.answers
  if (!answers) {
    throw new Error('No answers found in Jotform submission')
  }

  // Jotform /submission/{id} returns answers keyed by numeric question ID
  const nameField = answers['14']
  const emailField = answers['19']
  const phoneField = answers['18']
  const pickupField = answers['11']
  const returnField = answers['12']

  const customerName = nameField?.answer
    ? (typeof nameField.answer === 'object'
        ? `${nameField.answer.first || ''} ${nameField.answer.last || ''}`.trim()
        : String(nameField.answer))
    : 'Unknown'

  const customerEmail = emailField?.answer || ''
  const customerPhone = phoneField?.answer
    ? (typeof phoneField.answer === 'object'
        ? phoneField.answer.full || Object.values(phoneField.answer).join('')
        : String(phoneField.answer))
    : ''

  // Parse the date fields — returns YYYY-MM-DD strings, no Date objects
  const pickupDate = parseJotformDate(pickupField?.answer || {})
  const returnDate = parseJotformDate(returnField?.answer || {})

  return {
    submissionId,
    customerName,
    customerEmail,
    customerPhone,
    pickupDate,
    returnDate,
  }
}
