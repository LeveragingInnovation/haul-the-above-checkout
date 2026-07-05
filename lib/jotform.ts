export interface JotformSubmission {
  submissionId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  pickupDate: Date
  returnDate: Date
}

interface DateTimeField {
  day?: string
  month?: string
  year?: string
  hour?: string
  min?: string
}

function parseJotformDate(field: DateTimeField): Date {
  const month = parseInt(field.month || '1', 10)
  const day = parseInt(field.day || '1', 10)
  const year = parseInt(field.year || '2026', 10)
  return new Date(year, month - 1, day)
}

// Test fixtures
const TEST_SUBMISSIONS: Record<string, JotformSubmission> = {
  'test-1day': {
    submissionId: 'test-1day',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '(555) 555-5555',
    pickupDate: new Date(2026, 6, 6), // July 6, 2026
    returnDate: new Date(2026, 6, 6), // July 6, 2026
  },
  'test-2day': {
    submissionId: 'test-2day',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '(555) 555-5555',
    pickupDate: new Date(2026, 6, 6), // July 6, 2026
    returnDate: new Date(2026, 6, 7), // July 7, 2026
  },
  'test-8day': {
    submissionId: 'test-8day',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '(555) 555-5555',
    pickupDate: new Date(2026, 6, 6),  // July 6, 2026
    returnDate: new Date(2026, 6, 13), // July 13, 2026
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

  // Parse fields - Jotform field structure
  const nameField = answers.q14_renterName
  const emailField = answers.q19_customerEmail
  const phoneField = answers.q18_customerPhone
  const pickupField = answers.q11_pickupDateTime
  const returnField = answers.q12_returnDateTime

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
