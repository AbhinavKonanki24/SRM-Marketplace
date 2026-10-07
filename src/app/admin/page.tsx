import { getPendingListings, isAdmin } from '@/lib/data';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Check, X, ShieldAlert } from 'lucide-react';
import { approveListing, rejectListing } from '@/lib/actions';

export default async function AdminDashboard() {
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    redirect('/');
  }

  const pendingListings = await getPendingListings();

  return (
    <div className="pt-6 px-4 md:px-0 max-w-4xl mx-auto space-y-8 pb-24 md:pb-8">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
        <ShieldAlert className="text-amber-500" size={32} />
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Admin Approval Dashboard</h1>
          <p className="text-[var(--color-muted)] text-sm">Review and approve new marketplace listings.</p>
        </div>
      </div>

      {pendingListings.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4 border border-[var(--color-border)] shadow-sm">
            <Check className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-2">All Caught Up!</h3>
          <p className="text-[var(--color-muted)] max-w-sm">
            There are no pending listings requiring your approval right now.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingListings.map((listing: any) => (
            <div key={listing.id} className="flex flex-col md:flex-row gap-6 p-4 rounded-[24px] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
              <div className="relative w-full md:w-48 h-48 rounded-[16px] overflow-hidden shrink-0">
                <Image 
                  src={listing.photo_urls?.[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop'} 
                  alt={listing.title} 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between space-y-4 md:space-y-0">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-[var(--color-foreground)]">{listing.title}</h2>
                    <span className="text-xl font-bold text-amber-500">₹{listing.price}</span>
                  </div>
                  <p className="text-sm text-[var(--color-muted)] line-clamp-2 mb-4">{listing.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)]">
                      Condition: {listing.condition}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)]">
                      Seller: {listing.seller?.name || 'Unknown'} ({listing.seller?.hostel_block})
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                  <form action={approveListing.bind(null, listing.id)} className="flex-1">
                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                      <Check size={18} /> Approve
                    </button>
                  </form>
                  <form action={rejectListing.bind(null, listing.id)} className="flex-1">
                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20">
                      <X size={18} /> Reject
                    </button>
                  </form>
                  <Link href={`/listing/${listing.id}`} className="flex items-center justify-center px-4 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-colors text-sm font-medium">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
