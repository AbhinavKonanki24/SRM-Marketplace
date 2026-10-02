import { getConversationById, getMessages } from '@/lib/data'
import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Key, Info, ShieldCheck, AlertTriangle } from 'lucide-react'
import { sendMessage, grantRoomConsent } from '@/lib/actions'

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const conversation = await getConversationById(resolvedParams.id);
  
  if (!conversation) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const messages = await getMessages(resolvedParams.id);

  const isBuyer = user.id === conversation.buyer_id;
  const otherUser = isBuyer ? conversation.seller : conversation.buyer;

  return (
    <div className="flex flex-col h-[100dvh] md:h-[80vh] md:mt-6 bg-[var(--color-background)] md:bg-[var(--color-surface)] md:rounded-[32px] md:border md:border-[var(--color-border)] overflow-hidden">
      
      {/* Header */}
      <div className="p-4 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="p-2 -ml-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-foreground)] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" aria-label="Back to messages">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-10 h-10 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-foreground)] shrink-0">
            {otherUser?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="font-semibold text-[var(--color-foreground)]">{otherUser?.name}</div>
            <Link href={`/listing/${conversation.listing_id}`} className="text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors truncate max-w-[200px] block focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">
              {conversation.listing?.title}
            </Link>
          </div>
        </div>

        {/* Room Reveal Logic */}
        {!conversation.seller_consent_given ? (
          !isBuyer ? (
            <form action={grantRoomConsent.bind(null, conversation.id)}>
              <button className="flex items-center gap-1.5 text-xs font-medium bg-[var(--color-accent)] text-[var(--color-accent-foreground)] px-3 py-1.5 rounded-full hover:bg-[var(--color-accent-hover)] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">
                <Key size={14} /> Share My Room
              </button>
            </form>
          ) : (
             <div className="text-xs bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-muted)] px-3 py-1.5 rounded-full flex items-center gap-1.5">
               <ShieldCheck size={14} /> Awaiting Consent
             </div>
          )
        ) : (
          <div className="text-xs bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] px-3 py-1.5 rounded-full flex flex-col items-end">
            <span className="font-semibold text-[10px] text-[var(--color-muted)]">Room Shared</span>
            <span>{otherUser?.hostel_block} {isBuyer ? conversation.seller?.room_number : 'Yes'}</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
        
        <div className="flex justify-center my-4">
          <div className="flex flex-col gap-2 max-w-[80%]">
            <div className="px-4 py-2 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px] text-[var(--color-muted)] text-center flex items-center gap-2">
              <Info size={14} className="shrink-0" />
              Arrange offline exchange here. Seller room details are hidden until the seller shares them.
            </div>
            <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 text-center flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              No online payments. Only pay in-person via Cash/UPI after checking the item.
            </div>
          </div>
        </div>

        {messages.map((msg: { id: string, sender_id: string, body: string }) => {
          const isMine = msg.sender_id === user.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 text-sm ${isMine ? 'bg-[var(--color-accent)] text-[var(--color-accent-foreground)] rounded-2xl rounded-br-sm' : 'bg-[var(--color-surface-hover)] text-[var(--color-foreground)] rounded-2xl rounded-bl-sm border border-[var(--color-border)]'}`}>
                {msg.body}
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] pb-safe">
        <form action={sendMessage} className="flex gap-2 relative">
          <input type="hidden" name="conversation_id" value={conversation.id} />
          <input 
            type="text"
            name="body"
            required
            autoComplete="off"
            placeholder="Message"
            className="flex-1 px-4 py-3 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors text-sm placeholder:text-[var(--color-muted)]"
          />
          <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium rounded-full hover:bg-[var(--color-accent-hover)] transition-colors text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
