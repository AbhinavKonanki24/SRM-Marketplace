import { getConversations } from '@/lib/data'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import Avatar from '@/components/avatar'

export default async function MessagesIndexPage() {
  const conversations = await getConversations();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    import('next/navigation').then(m => m.redirect('/login'));
  }

  return (
    <div className="pt-6 px-4 md:px-0 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-6">Messages</h1>
      
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4 border border-[var(--color-border)] shadow-sm">
            <MessageSquare className="w-6 h-6 text-[var(--color-muted)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-2">No messages yet</h3>
          <p className="text-[var(--color-muted)] max-w-sm">
            When you contact sellers or buyers message you about your listings, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map(conv => {
            const isBuyer = user?.id === conv.buyer_id;
            const otherUser = isBuyer ? conv.seller : conv.buyer;
            
            return (
              <Link 
                href={`/messages/${conv.id}`} 
                key={conv.id} 
                className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] shadow-sm"
              >
                <Avatar userId={otherUser?.id} name={otherUser?.name || 'User'} size={48} />
                <div className="flex-1 overflow-hidden">
                  <div className="font-semibold text-[var(--color-foreground)] truncate">{otherUser?.name}</div>
                  <div className="text-sm text-[var(--color-muted)] truncate">{conv.listing?.title}</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
