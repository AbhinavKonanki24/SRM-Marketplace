'use client'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-md p-8 md:p-10 text-center shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-white">Something went wrong!</h2>
        <p className="text-[var(--color-muted)] text-sm mb-8 leading-relaxed">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-4 rounded-xl font-semibold bg-white text-black hover:bg-gray-200 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white focus-visible:outline-none"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
