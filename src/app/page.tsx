import { getListings, getCategories } from '@/lib/data'
import Link from 'next/link'
import { Search, SlidersHorizontal, Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string, block?: string, cat?: string, focus?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const q = resolvedParams.q;
  const block = resolvedParams.block;
  const activeCat = resolvedParams.cat;
  const shouldFocusSearch = resolvedParams.focus === 'search';

  const categories = await getCategories();

  // Helper to safely build URL search params without "undefined" strings
  const buildParams = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...resolvedParams, ...newParams };
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== '' && key !== 'focus') {
        params.set(key, value);
      }
    }
    return params.toString();
  };
  
  // Quick in-memory filter for category since we don't have it in getListings yet
  let listings = await getListings(q, block);
  if (activeCat) {
    listings = listings.filter(l => l.category_id === activeCat);
  }

  const HOSTEL_BLOCKS = ["Adhiyaman", "Nelson Mandela", "Paari", "Oori", "Kaari", "Manoranjitham", "Agasthyar", "Sannasi"];

  return (
    <div className="pt-6 px-4 md:px-0 flex flex-col md:flex-row gap-8 items-start pb-24 md:pb-8">
      
      {/* Main Content (Left Side) */}
      <div className="flex-1 w-full space-y-6">
        {/* Search Bar & Mobile Filters */}
        <form action="/" className="flex flex-col sm:flex-row gap-3 group">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)] group-focus-within:text-[var(--color-accent)] transition-colors duration-300" />
            <input
              key={shouldFocusSearch ? 'focus-true' : 'focus-false'}
              type="text"
              name="q"
              id="search-input"
              defaultValue={q}
              autoFocus={shouldFocusSearch}
              placeholder="Search"
              aria-label="Search listings"
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full py-3.5 pl-12 pr-4 text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all duration-300 shadow-sm focus:shadow-md placeholder:text-[var(--color-muted)]"
            />
          </div>
          <div className="flex gap-2">
            <select name="block" defaultValue={block || ""} className="md:hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-3 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
              <option value="">All Hostels</option>
              {HOSTEL_BLOCKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <input type="hidden" name="cat" value={activeCat || ""} />
            <button type="submit" aria-label="Filters" className="w-12 h-12 shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm">
              <SlidersHorizontal className="w-5 h-5 text-[var(--color-foreground)]" />
            </button>
          </div>
        </form>

        {/* Mobile Categories (Horizontal) */}
        <div className="md:hidden flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-4 px-4">
          <Link href={`/?${buildParams({cat: ''})}`} className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${!activeCat ? 'bg-[var(--color-foreground)] text-[var(--color-background)] scale-105' : 'bg-transparent border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)]'}`}>
            All
          </Link>
          {categories.map((cat: { id: string, name: string }) => (
            <Link 
              key={cat.id} 
              href={`/?${buildParams({cat: cat.id})}`}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${activeCat === cat.id ? 'bg-[var(--color-foreground)] text-[var(--color-background)] scale-105' : 'bg-transparent border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)]'}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-2">
          {listings.map((listing: { id: string, title: string, price: number, condition: string, photo_urls: string[], seller: { hostel_block: string } }) => (
            <Link href={`/listing/${listing.id}`} key={listing.id} className="group flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-[24px]">
              <div className="aspect-[4/5] rounded-[24px] overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] relative shadow-sm group-hover:shadow-md transition-shadow duration-500">
                <img 
                  src={listing.photo_urls?.[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop'} 
                  alt={listing.title} 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                />
                {listing.seller?.hostel_block && (
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/10">
                    {listing.seller.hostel_block}
                  </div>
                )}
              </div>
              <div className="px-1 flex justify-between items-start group-hover:translate-x-1 transition-transform duration-300">
                <div>
                  <h3 className="font-medium text-sm text-[var(--color-foreground)] line-clamp-1">{listing.title}</h3>
                  <p className="text-lg font-bold mt-1 text-[var(--color-foreground)]">₹{listing.price}</p>
                </div>
              </div>
            </Link>
          ))}

          {listings.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4 border border-[var(--color-border)] shadow-sm">
                <Search className="w-6 h-6 text-[var(--color-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-2">No listings found</h3>
              <p className="text-[var(--color-muted)] max-w-sm">
                We couldn&apos;t find any items matching your search. Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sidebar Filters (Right Side) */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-8 sticky top-24">
        
        {/* Categories Section */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider px-2 mb-3">Categories</h3>
          <div className="flex flex-col gap-1.5">
            <Link 
              href={`/?${buildParams({cat: ''})}`} 
              className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center gap-3 ${!activeCat ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] shadow-sm translate-x-2' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]'}`}
            >
              All Categories
            </Link>
            {categories.map((cat: { id: string, name: string }) => (
              <Link 
                key={cat.id} 
                href={`/?${buildParams({cat: cat.id})}`}
                className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center gap-3 ${activeCat === cat.id ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] shadow-sm translate-x-2' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]'}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Hostels Section */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider px-2 mb-3">Hostel Block</h3>
          <div className="flex flex-col gap-1.5">
            <Link 
              href={`/?${buildParams({block: ''})}`} 
              className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center gap-3 ${!block ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] shadow-sm translate-x-2' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]'}`}
            >
              All Hostels
            </Link>
            {HOSTEL_BLOCKS.map((b) => (
              <Link 
                key={b} 
                href={`/?${buildParams({block: b})}`}
                className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center gap-3 ${block === b ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] shadow-sm translate-x-2' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]'}`}
              >
                {b}
              </Link>
            ))}
          </div>
        </div>

      </aside>

      {/* Mobile Create Button */}
      <Link href="/create-listing" aria-label="Create new listing" className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] rounded-full flex items-center justify-center shadow-lg z-40 hover:bg-[var(--color-accent-hover)] transition-all duration-300 active:scale-90 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)]">
        <Plus size={24} />
      </Link>
    </div>
  )
}
