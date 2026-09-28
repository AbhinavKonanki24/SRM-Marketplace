'use client'

import { useState } from 'react'
import { ImagePlus, CheckCircle2 } from 'lucide-react'

export default function PhotoUploader() {
  const [fileCount, setFileCount] = useState(0)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--color-muted)]">Photos</label>
      <div className={`border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer relative ${fileCount > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] focus-within:ring-2 focus-within:ring-[var(--color-accent)] focus-within:border-transparent'}`}>
        {fileCount > 0 ? (
          <>
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
            <p className="text-sm text-emerald-500 font-medium">{fileCount} photo(s) selected</p>
            <p className="text-xs text-emerald-500/70 mt-1">Tap to change photos</p>
          </>
        ) : (
          <>
            <ImagePlus className="w-8 h-8 text-[var(--color-muted)] mb-3" />
            <p className="text-sm text-[var(--color-foreground)] font-medium">Tap to upload photos</p>
            <p className="text-xs text-[var(--color-muted)] mt-1">Up to 5 images</p>
          </>
        )}
        <input 
          type="file" 
          name="photos" 
          multiple 
          accept="image/*"
          onChange={(e) => setFileCount(e.target.files?.length || 0)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
    </div>
  )
}
