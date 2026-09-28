import { getListings, getCategories } from '@/lib/data'
import Link from 'next/link'
import { Search, SlidersHorizontal, Plus } from 'lucide-react'

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string, block?: string, cat?: string }> }) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q;
  const block = resolvedParams.block;
  const activeCat = resolvedParams.cat;

  const categories = await getCategories();
  
  // Quick in-memory filter for category since we don't have it in getListings yet
  let listings = await getListings(q, block);
  if (activeCat) {
    listings = listings.filter(l => l.category_id === activeCat);
  }

  return (
    <div className="pt-6 px-4 md:px-0 space-y-6">
      
      {/* Search Bar */}
      <form action="/" className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search"
            aria-label="Search listings"
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full py-3.5 pl-12 pr-4 text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors placeholder:text-[var(--color-muted)]"
          />
        </div>
        <button type="button" aria-label="Filters" className="w-12 h-12 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-colors">
          <SlidersHorizontal className="w-5 h-5 text-[var(--color-foreground)]" />
        </button>
      </form>

      {/* Categories */}
      <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <Link href="/" className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${!activeCat ? 'bg-[var(--color-foreground)] text-[var(--color-background)]' : 'bg-transparent border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}>
          All
        </Link>
        {categories.map((cat: { id: string, name: string }) => (
          <Link 
            key={cat.id} 
            href={`/?cat=${cat.id}`}
            className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${activeCat === cat.id ? 'bg-[var(--color-foreground)] text-[var(--color-background)]' : 'bg-transparent border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pt-2">
        {listings.map((listing: { id: string, title: string, price: number, condition: string, photo_urls: string[] }) => (
          <Link href={`/listing/${listing.id}`} key={listing.id} className="group flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-[24px]">
            <div className="aspect-[4/5] rounded-[24px] overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] relative">
              <img 
                src={listing.photo_urls?.[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop'} 
                alt={listing.title} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="px-1 flex justify-between items-start">
              <div>
                <h3 className="font-medium text-sm text-[var(--color-foreground)] line-clamp-1">{listing.title}</h3>
                <p className="text-lg font-bold mt-1 text-[var(--color-foreground)]">₹{listing.price}</p>
              </div>
            </div>
          </Link>
        ))}

        {listings.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4 border border-[var(--color-border)]">
              <Search className="w-6 h-6 text-[var(--color-muted)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-2">No listings found</h3>
            <p className="text-[var(--color-muted)] max-w-sm">
              We couldn&apos;t find any items matching your search. Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </div>

      <Link href="/create-listing" aria-label="Create new listing" className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] rounded-full flex items-center justify-center shadow-lg z-40 hover:bg-[var(--color-accent-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)]">
        <Plus size={24} />
      </Link>
    </div>
  )
}
