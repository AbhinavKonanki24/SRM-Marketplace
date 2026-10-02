'use client'

import { useState, useRef } from 'react'
import { Camera, X, UserCircle } from 'lucide-react'
import Image from 'next/image'

export default function ProfilePhotoEditor({ 
  userId, 
  initialName 
}: { 
  userId: string, 
  initialName: string 
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [loadError, setLoadError] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Add a timestamp to the URL if we are not previewing to bust cache on initial load if recently changed
  const avatarUrl = `${supabaseUrl}/storage/v1/object/public/listing-photos/${userId}/avatar`

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Photo must be less than 5MB")
        return
      }
      const url = URL.createObjectURL(file)
      setPreview(url)
      setIsRemoving(false)
      setLoadError(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setIsRemoving(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const showFallback = (!preview && isRemoving) || (!preview && loadError)

  return (
    <div className="flex flex-col items-center sm:items-start gap-4">
      <div className="relative group">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-sm relative flex items-center justify-center">
          {preview ? (
            <Image src={preview} alt="Preview" fill className="object-cover" />
          ) : showFallback ? (
            <div className="text-[var(--color-muted)] flex flex-col items-center">
               <UserCircle size={48} strokeWidth={1.5} />
            </div>
          ) : (
            <Image 
              src={avatarUrl} 
              alt={initialName} 
              fill 
              className="object-cover" 
              unoptimized
              onError={() => setLoadError(true)}
            />
          )}

          {/* Hover overlay to change photo */}
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
          >
            <Camera size={24} className="mb-1" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Change</span>
          </button>
        </div>

        {/* Remove button (only show if there's a custom photo or preview) */}
        {(!showFallback || preview) && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 z-10"
            aria-label="Remove photo"
          >
            <X size={14} strokeWidth={3} />
          </button>
        )}
      </div>

      <input 
        type="file" 
        name="photo" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp" 
        className="hidden" 
      />
      <input type="hidden" name="remove_photo" value={isRemoving ? 'true' : 'false'} />
    </div>
  )
}
