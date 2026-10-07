import 'server-only';
import { createClient } from '@/utils/supabase/server';

export const ADMIN_EMAILS = ['ak0902@srmist.edu.in', 'abhi@srmist.edu.in'];

export async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  return ADMIN_EMAILS.includes(user.email || '');
}

export async function getListings(search?: string, hostelBlock?: string, categoryId?: string) {
  const supabase = await createClient();
  let query = supabase.from('listings').select(`
    *,
    seller:profiles(id, name, hostel_block)
  `).eq('status', 'available').eq('approval_status', 'approved').order('created_at', { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }

  if (hostelBlock) {
    return data.filter(listing => listing.seller?.hostel_block === hostelBlock);
  }

  return data;
}

export async function getPendingListings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) return [];

  const { data, error } = await supabase.from('listings').select(`
    *,
    seller:profiles(id, name, hostel_block)
  `).eq('approval_status', 'pending').order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching pending listings:", error);
    return [];
  }
  return data;
}

export async function getListingById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.from('listings').select(`
    *,
    seller:profiles(id, name, hostel_block)
  `).eq('id', id).single();
  
  if (error || !data) return null;

  // If the listing is not approved, only the seller or an admin can view it
  if (data.approval_status !== 'approved') {
    if (!user) return null;
    const isSeller = data.seller_id === user.id;
    const isAdminUser = ADMIN_EMAILS.includes(user.email || '');
    if (!isSeller && !isAdminUser) return null;
  }

  return data;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('*');
  return data || [];
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return null; // Ensure users can only get their own secure profile details if needed, or at least only attach email for themselves. Wait, if another user views this, they shouldn't see email. But getUserProfile is only called for the logged-in user on /profile!
  
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return null;
  
  const { data: privateProfile } = await supabase.from('private_profiles').select('room_number').eq('id', userId).single();
  return { ...profile, room_number: privateProfile?.room_number || '', email: user.email };
}

export async function getActiveListingsByUser(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('listings').select('*').eq('seller_id', userId).order('created_at', { ascending: false });
  return data || [];
}

export async function getConversations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.from('conversations').select(`
    *,
    listing:listings(title, photo_urls, status),
    buyer:profiles!buyer_id(id, name),
    seller:profiles!seller_id(id, name)
  `).or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`).order('created_at', { ascending: false });

  return data || [];
}

export async function getConversationById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('conversations').select(`
    *,
    listing:listings(title, photo_urls, status, price, exchange_method),
    buyer:profiles!buyer_id(id, name, hostel_block),
    seller:profiles!seller_id(id, name, hostel_block)
  `).eq('id', id).single();
  
  if (error || !data) return null;

  let sellerRoom = null;
  if (data.seller_consent_given) {
    const { data: room, error: rpcError } = await supabase.rpc('reveal_room_details', { p_conversation_id: id });
    if (!rpcError) {
      sellerRoom = room;
    }
  }

  return {
    ...data,
    seller: {
      ...data.seller,
      room_number: sellerRoom
    }
  };
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
  return data || [];
}
