import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Haul The Above</h1>
        <p className="text-gray-500 mb-8 text-sm">Dump Trailer Rental — Secure Checkout</p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left text-sm text-blue-800">
          <p className="font-semibold mb-1">Customers</p>
          <p>You should have been redirected here automatically after completing your rental agreement. If you landed here directly, please contact us to receive your checkout link.</p>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-wide">Test Scenarios</p>
          <div className="flex flex-col gap-2">
            <Link href="/checkout?submissionId=test-1day"
              className="block bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-700 transition">
              Test — 1 Day ($500)
            </Link>
            <Link href="/checkout?submissionId=test-2day"
              className="block bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-700 transition">
              Test — 2 Days ($650)
            </Link>
            <Link href="/checkout?submissionId=test-8day"
              className="block bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-700 transition">
              Test — 8 Days ($1,550)
            </Link>
            <Link href="/dashboard"
              className="block border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition mt-1">
              Owner Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
