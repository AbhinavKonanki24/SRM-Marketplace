import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-4xl font-bold text-white mb-4">404</h2>
      <p className="text-lg text-[var(--color-muted)] mb-8">
        We couldn&apos;t find the page you were looking for.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 rounded-full font-medium bg-white text-black hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        Return Home
      </Link>
    </div>
  )
}
