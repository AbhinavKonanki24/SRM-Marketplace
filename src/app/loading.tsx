export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] border-t-white animate-spin"></div>
        <p className="text-sm font-medium text-[var(--color-muted)] animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
