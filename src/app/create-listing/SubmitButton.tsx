'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full py-4 rounded-full font-semibold bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)]"
    >
      {pending ? 'Uploading Item...' : 'Post Item'}
    </button>
  )
}
