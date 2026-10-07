'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, MessageSquare, User, ShieldAlert } from 'lucide-react'

export default function BottomNav({ user }: { user: any }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      router.push('/')
      // Reset input manually if present
      const searchInput = document.getElementById('search-input') as HTMLInputElement
      if (searchInput) {
        searchInput.value = ''
        searchInput.blur()
      }
    }
  }

  const handleSearchClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      const searchInput = document.getElementById('search-input') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      } else {
        router.push('/?focus=search')
      }
    }
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        <Link 
          href="/" 
          onClick={handleHomeClick}
          className={`flex flex-col items-center gap-1 w-full transition-colors ${pathname === '/' ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}
        >
          <Home size={20} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link 
          href="/?focus=search" 
          onClick={handleSearchClick}
          className={`flex flex-col items-center gap-1 w-full transition-colors ${pathname === '/?focus=search' ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}
        >
          <Search size={20} />
          <span className="text-[10px] font-medium">Search</span>
        </Link>
        {user ? (
          <>
            <Link 
              href="/messages" 
              className={`flex flex-col items-center gap-1 w-full transition-colors ${pathname.startsWith('/messages') ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}
            >
              <MessageSquare size={20} />
              <span className="text-[10px] font-medium">Chat</span>
            </Link>
            <Link 
              href="/profile" 
              className={`flex flex-col items-center gap-1 w-full transition-colors ${pathname === '/profile' ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}
            >
              <User size={20} />
              <span className="text-[10px] font-medium">Profile</span>
            </Link>
            {user?.email === 'abhi@srmist.edu.in' && (
              <Link 
                href="/admin" 
                className={`flex flex-col items-center gap-1 w-full transition-colors ${pathname === '/admin' ? 'text-amber-500' : 'text-[var(--color-muted)] hover:text-amber-500'}`}
              >
                <ShieldAlert size={20} />
                <span className="text-[10px] font-medium">Admin</span>
              </Link>
            )}
          </>
        ) : (
          <Link 
            href="/login" 
            className={`flex flex-col items-center gap-1 w-full transition-colors ${pathname === '/login' ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}
          >
            <User size={20} />
            <span className="text-[10px] font-medium">Log In</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
