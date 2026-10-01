'use client'
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error(error)
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased min-h-screen flex items-center justify-center">
        <div className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Critical Application Error</h2>
          <p className="text-gray-400 text-sm mb-8">
            The application encountered a critical error and could not recover.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-xl font-semibold bg-white text-black hover:bg-gray-200 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
