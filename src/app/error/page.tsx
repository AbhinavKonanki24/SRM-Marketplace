'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Sorry, something went wrong. Invalid login credentials or user does not exist.'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-md p-8 md:p-10 text-center shadow-2xl">
        <h1 className="text-2xl font-bold mb-4 text-white">Action Failed</h1>
        <p className="text-[var(--color-muted)] text-sm mb-8 leading-relaxed">
          {message}
        </p>
        <Link href="/login" className="block w-full py-4 rounded-xl font-semibold bg-white text-black hover:bg-gray-200 transition-colors">
          Return to Login
        </Link>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-white">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
