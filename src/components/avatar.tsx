'use client'

import { useState } from 'react'
import Image from 'next/image'
import { UserCircle } from 'lucide-react'

export default function Avatar({ 
  userId, 
  name, 
  size = 40,
  className = ""
}: { 
  userId: string | undefined, 
  name: string | undefined,
  size?: number,
  className?: string
}) {
  const [error, setError] = useState(false)

  if (!userId || error) {
    return (
      <div 
        className={`rounded-full bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-foreground)] shrink-0 ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(12, size * 0.4) }}
      >
        {name ? name.charAt(0).toUpperCase() : <UserCircle size={size * 0.6} className="text-[var(--color-muted)]" />}
      </div>
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const avatarUrl = `${supabaseUrl}/storage/v1/object/public/listing-photos/${userId}/avatar`

  return (
    <div 
      className={`relative rounded-full overflow-hidden shrink-0 border border-[var(--color-border)] bg-[var(--color-background)] ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={avatarUrl}
        alt={name || 'User avatar'}
        fill
        className="object-cover"
        unoptimized // We use unoptimized to prevent Next.js image optimization caching issues with 404s
        onError={() => setError(true)}
      />
    </div>
  )
}
