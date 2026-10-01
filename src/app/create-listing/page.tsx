import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Info } from 'lucide-react'
import { createListing } from '@/lib/actions'
import { getCategories } from '@/lib/data'

import SubmitButton from './SubmitButton'
import PhotoUploader from './PhotoUploader'

export default async function CreateListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('hostel_block')
    .eq('id', user.id)
    .single()
    
  const { data: privateProfile } = await supabase
    .from('private_profiles')
    .select('room_number')
    .eq('id', user.id)
    .single()

  if (!profile?.hostel_block || !privateProfile?.room_number) {
    redirect('/profile?message=Please complete your profile (Hostel Block and Room Number) before posting a listing.')
  }

  const categories = await getCategories()

  return (
    <div className="max-w-2xl mx-auto pt-6 px-4 md:px-0 pb-24">
      <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-6">Post an Item</h1>
      
      <div className="mb-6 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-start gap-3 shadow-sm">
        <Info className="shrink-0 mt-0.5 text-[var(--color-accent)]" size={18} />
        <p className="text-xs text-[var(--color-muted)] leading-relaxed">
          For your safety, your room number is hidden by default. It will only be shared when you explicitly approve a buyer&apos;s message request.
        </p>
      </div>

      <form action={createListing} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-muted)]">Title</label>
          <input 
            name="title"
            required 
            placeholder="e.g. MacBook Pro M1"
            className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors placeholder:text-[var(--color-muted)]"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-muted)]">Price (₹)</label>
            <input 
              name="price"
              type="number" 
              required 
              min="0"
              placeholder="e.g. 50000"
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors placeholder:text-[var(--color-muted)]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-muted)]">Condition</label>
            <select 
              name="condition"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors placeholder:text-[var(--color-muted)] appearance-none"
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-muted)]">Category</label>
          <select 
            name="category_id"
            required
            className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors placeholder:text-[var(--color-muted)] appearance-none"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-muted)]">Description</label>
          <textarea 
            name="description"
            rows={4}
            required
            placeholder="Describe the item, its features, and any flaws..."
            className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors placeholder:text-[var(--color-muted)] resize-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-muted)]">Exchange Method</label>
            <select 
              name="exchange_method"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors placeholder:text-[var(--color-muted)] appearance-none"
            >
              <option value="pickup">Buyer Pickup</option>
              <option value="delivery">Seller Delivery</option>
              <option value="either">Either</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-muted)]">Preferred Time</label>
            <input 
              name="preferred_time"
              placeholder="e.g. Evenings"
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors placeholder:text-[var(--color-muted)]"
            />
          </div>
        </div>

        <PhotoUploader />

        <div className="pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
