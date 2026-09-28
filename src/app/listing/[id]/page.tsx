import { getListingById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageSquare, Info } from 'lucide-react';
import Link from 'next/link';
import { startConversation, deleteListing, markAsSold } from '@/lib/actions';
import { createClient } from '@/utils/supabase/server';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const listing = await getListingById(resolvedParams.id);
  
  if (!listing) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSeller = user?.id === listing.seller?.id;

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Mobile Top Nav Overlay */}
      <div className="absolute top-0 w-full p-4 flex justify-between z-10 md:hidden">
        <Link href="/" aria-label="Go back" className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-[var(--color-border)] flex items-center justify-center text-[var(--color-foreground)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]">
          <ArrowLeft size={20} />
        </Link>
      </div>

      {/* Image Area */}
      <div className="w-full aspect-square md:aspect-auto md:h-[60vh] bg-[var(--color-surface)] relative overflow-hidden">
        <img 
          src={listing.photo_urls?.[0]} 
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        
        {/* Pagination Dots Simulator */}
        {listing.photo_urls && listing.photo_urls.length > 1 && (
          <div className="absolute bottom-6 w-full flex justify-center gap-1.5 z-10">
            {listing.photo_urls.map((_: string, i: number) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
            ))}
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="px-6 py-8 md:max-w-3xl md:mx-auto pb-32">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">{listing.title}</h1>
            <div className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
               <span className="bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-1 rounded-full">{listing.condition}</span>
               <span>•</span>
               <span>{listing.seller?.hostel_block}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-[var(--color-foreground)]">
            ₹{listing.price}
          </div>
        </div>

        <p className="text-[var(--color-muted)] leading-relaxed text-sm mb-8">
          {listing.description}
        </p>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] mb-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-foreground)] shrink-0">
            {listing.seller?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <div className="text-xs text-[var(--color-muted)]">Seller</div>
            <div className="font-medium text-[var(--color-foreground)]">{listing.seller?.name || 'Student'}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] text-sm flex gap-3 shadow-sm">
           <Info size={18} className="shrink-0 mt-0.5 text-[var(--color-accent)]" />
           <p>Exchange method: <span className="capitalize font-medium text-[var(--color-foreground)]">{listing.exchange_method}</span>. Contact seller to arrange a meeting and reveal room details securely.</p>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)] to-transparent md:static md:bg-none md:max-w-3xl md:mx-auto md:p-0 md:mb-12">
        <div className="md:bg-[var(--color-surface)] md:border md:border-[var(--color-border)] md:p-4 rounded-[28px] md:shadow-sm">
          {isSeller ? (
            <div className="flex flex-col gap-2">
              {listing.status === 'available' ? (
                <form action={markAsSold.bind(null, listing.id)}>
                  <button type="submit" className="w-full flex items-center justify-center py-4 rounded-full font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                    Mark as Sold
                  </button>
                </form>
              ) : (
                <div className="w-full flex items-center justify-center py-4 rounded-full font-medium bg-[var(--color-border)] text-[var(--color-muted)]">
                  Item Sold
                </div>
              )}
              <form action={deleteListing.bind(null, listing.id)}>
                <button type="submit" className="w-full flex items-center justify-center py-4 rounded-full font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                  Delete Listing
                </button>
              </form>
            </div>
          ) : (
            <form action={startConversation.bind(null, listing.id)}>
              <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-semibold bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)]">
                <MessageSquare size={20} />
                Contact Seller
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
