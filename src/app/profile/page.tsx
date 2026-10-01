import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile } from '@/lib/actions'
import { BadgeCheck, UserCircle, LogOut } from 'lucide-react'
import { getActiveListingsByUser, getUserProfile } from '@/lib/data'
import Link from 'next/link'
import { signOutUser } from '@/lib/actions'

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ success?: string, message?: string }> }) {
  const resolvedParams = await searchParams;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const fullProfile = await getUserProfile(user.id);
  const activeListings = await getActiveListingsByUser(user.id);

  return (
    <div className="max-w-2xl mx-auto pt-6 px-4 md:px-0 space-y-8 pb-24">
      {resolvedParams.success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium">
          Profile updated successfully!
        </div>
      )}
      {resolvedParams.message && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium">
          {resolvedParams.message}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center border border-[var(--color-border)] shadow-sm">
            <UserCircle size={40} className="text-[var(--color-muted)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
              {fullProfile?.name || 'Your Profile'}
              <BadgeCheck className="text-emerald-500" size={20} />
            </h1>
            <p className="text-[var(--color-muted)] text-sm">{fullProfile?.email}</p>
          </div>
        </div>
        <form action={signOutUser}>
          <button type="submit" className="p-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-[var(--color-muted)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shadow-sm" aria-label="Sign out">
            <LogOut size={20} />
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <form action={updateProfile} className="space-y-6">
          <h2 className="text-lg font-bold text-white">Profile Details</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-muted)]">Display Name</label>
            <input 
              name="name"
              defaultValue={fullProfile?.name || ''}
              placeholder="e.g. Rahul Sharma"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-muted)]">Hostel Block</label>
              <select 
                name="hostel_block"
                defaultValue={fullProfile?.hostel_block || ''}
                required
                className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors appearance-none"
              >
                <option value="">Select Block</option>
                <option value="Adhiyaman">Adhiyaman</option>
                <option value="Nelson Mandela">Nelson Mandela</option>
                <option value="Paari">Paari</option>
                <option value="Oori">Oori</option>
                <option value="Kaari">Kaari</option>
                <option value="Manoranjitham">Manoranjitham</option>
                <option value="Agasthyar">Agasthyar</option>
                <option value="Sannasi">Sannasi</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-muted)] flex justify-between">
                Room Number
              </label>
              <input 
                name="room_number"
                required
                defaultValue={fullProfile?.room_number || ''}
                placeholder="e.g. 404"
                className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <p className="text-xs text-[var(--color-muted)]">Your room number is strictly private. It is only shared securely in active exchange chats.</p>

          <button 
            type="submit"
            className="w-full py-4 rounded-full font-semibold bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)]"
          >
            Save Changes
          </button>
        </form>

        <div className="pt-8 border-t border-[var(--color-border)] space-y-4">
          <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-2">Your Active Listings</h2>
          {activeListings.length === 0 ? (
            <div className="text-[var(--color-muted)] text-sm py-4">
              You have no active listings.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {activeListings.map(listing => (
                <Link href={`/listing/${listing.id}`} key={listing.id} className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-2xl">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] mb-2 relative">
                     <img src={listing.photo_urls[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="font-medium text-[var(--color-foreground)] text-sm truncate">{listing.title}</h3>
                  <p className="text-[var(--color-muted)] text-xs">₹{listing.price}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
