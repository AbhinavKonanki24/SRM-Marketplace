import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Home, Search, MessageSquare, User } from 'lucide-react'
import StarBackground from '@/components/star-background'

export const metadata: Metadata = {
  title: 'SRM Campus Marketplace',
  description: 'A peer-to-peer buy/sell web app for SRM students.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)] pb-20 md:pb-0">
        <StarBackground />
        
        {/* Desktop Header (Hidden on Mobile) */}
        <header className="hidden md:flex bg-[var(--color-background)] border-b border-[var(--color-border)] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              SRM
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">Explore</Link>
              {user ? (
                <>
                  <Link href="/messages" className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">Messages</Link>
                  <Link href="/profile" className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">Profile</Link>
                  <Link href="/create-listing" className="text-sm font-medium bg-[var(--color-accent)] text-[var(--color-accent-foreground)] px-4 py-2 rounded-full hover:bg-[var(--color-accent-hover)] transition-colors">Post Item</Link>
                </>
              ) : (
                <Link href="/login" className="text-sm font-medium bg-[var(--color-accent)] text-[var(--color-accent-foreground)] px-5 py-2 rounded-full hover:bg-[var(--color-accent-hover)] transition-colors">Sign In</Link>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto md:px-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation (Hidden on Desktop) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] pb-safe z-50">
          <div className="flex justify-around items-center h-16">
            <Link href="/" className="flex flex-col items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-foreground)] w-full">
              <Home size={20} />
              <span className="text-[10px] font-medium">Home</span>
            </Link>
            <Link href="/?focus=search" className="flex flex-col items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-foreground)] w-full">
              <Search size={20} />
              <span className="text-[10px] font-medium">Search</span>
            </Link>
            {user ? (
              <>
                <Link href="/messages" className="flex flex-col items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-foreground)] w-full">
                  <MessageSquare size={20} />
                  <span className="text-[10px] font-medium">Chat</span>
                </Link>
                <Link href="/profile" className="flex flex-col items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-foreground)] w-full">
                  <User size={20} />
                  <span className="text-[10px] font-medium">Profile</span>
                </Link>
              </>
            ) : (
               <Link href="/login" className="flex flex-col items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-foreground)] w-full">
                  <User size={20} />
                  <span className="text-[10px] font-medium">Log In</span>
                </Link>
            )}
          </div>
        </nav>
      </body>
    </html>
  )
}
