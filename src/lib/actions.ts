'use server'

import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const ListingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  category_id: z.string().uuid("Invalid category"),
  price: z.coerce.number().min(0, "Price must be >= 0").max(100000000, "Price too high"),
  condition: z.enum(['New', 'Like New', 'Good', 'Fair', 'Poor']),
  description: z.string().min(1, "Description is required").max(2000, "Description too long"),
  exchange_method: z.enum(['pickup', 'delivery', 'either']),
  preferred_time: z.string().max(100).optional(),
});

export async function createListing(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  
  const rawData = {
    title: formData.get('title'),
    category_id: formData.get('category_id'),
    price: formData.get('price'),
    condition: formData.get('condition'),
    description: formData.get('description'),
    exchange_method: formData.get('exchange_method'),
    preferred_time: formData.get('preferred_time'),
  };

  const parsed = ListingSchema.safeParse(rawData);
  if (!parsed.success) {
    redirect('/error?message=' + encodeURIComponent(parsed.error.issues[0].message));
  }

  // Handle file uploads on server
  const photos = formData.getAll('photos') as File[];
  const photoUrls: string[] = [];
  const uploadedFilePaths: string[] = [];

  for (const photo of photos) {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (photo.size > 0 && photo.size < 15 * 1024 * 1024 && validMimeTypes.includes(photo.type)) { // 15MB limit and valid type
      const ext = photo.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${ext}`;
      const filePath = `${user.id}/${fileName}`;

      const { data } = await supabase.storage
        .from('listing-photos')
        .upload(filePath, photo);

      if (data) {
        uploadedFilePaths.push(filePath);
        const { data: publicUrl } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(filePath);
        photoUrls.push(publicUrl.publicUrl);
      }
    }
  }

  if (photoUrls.length === 0) {
    redirect('/error?message=At least one valid photo is required');
  }

  const { data, error } = await supabase.from('listings').insert({
    seller_id: user.id,
    title: parsed.data.title,
    category_id: parsed.data.category_id,
    price: parsed.data.price,
    condition: parsed.data.condition,
    description: parsed.data.description,
    exchange_method: parsed.data.exchange_method,
    preferred_time: parsed.data.preferred_time,
    photo_urls: photoUrls,
    status: 'available'
  }).select().single();

  if (error) {
    console.error(error);
    if (uploadedFilePaths.length > 0) {
      await supabase.storage.from('listing-photos').remove(uploadedFilePaths);
    }
    redirect('/error?message=Failed to create listing');
  }

  redirect(`/listing/${data.id}`);
}

const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  hostel_block: z.enum([
    "Adhiyaman", "Nelson Mandela", "Paari", "Oori", "Kaari", "Manoranjitham", "Agasthyar", "Sannasi"
  ], { message: "Invalid hostel block selected" }),
  room_number: z.string().min(1, "Room number is required").max(20),
});

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const rawData = {
    name: formData.get('name'),
    hostel_block: formData.get('hostel_block'),
    room_number: formData.get('room_number'),
  };

  const parsed = ProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    redirect('/error?message=' + encodeURIComponent(parsed.error.issues[0].message));
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    name: parsed.data.name,
    hostel_block: parsed.data.hostel_block,
    email: user.email || '',
  });

  if (profileError) {
    redirect('/error?message=Failed to update profile');
  }

  const { error: privateError } = await supabase.from('private_profiles').upsert({
    id: user.id,
    room_number: parsed.data.room_number,
  });

  if (privateError) {
    redirect('/error?message=Failed to update private profile');
  }

  revalidatePath('/', 'layout');
  redirect('/profile?success=true');
}

export async function startConversation(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const parsedId = z.string().uuid().safeParse(listingId);
  if (!parsedId.success) redirect('/error?message=Invalid listing ID');

  // 1. Fetch listing details to ensure it exists and get seller_id
  const { data: listing, error: lErr } = await supabase.from('listings').select('seller_id').eq('id', listingId).single();
  if (lErr || !listing) redirect('/error?message=Listing not found');

  if (listing.seller_id === user.id) {
     redirect('/error?message=Cannot start a conversation with yourself');
  }

  // 2. Check if a conversation already exists
  const { data: existing } = await supabase.from('conversations').select('id').eq('listing_id', listingId).eq('buyer_id', user.id).single();
  if (existing) {
    redirect(`/messages/${existing.id}`);
  }

  // 3. Insert new conversation
  const { data: newConv, error: insertErr } = await supabase.from('conversations').insert({
    listing_id: listingId,
    buyer_id: user.id,
    seller_id: listing.seller_id
  }).select('id').single();

  if (insertErr) {
    console.error(insertErr);
    redirect('/error?message=Failed to start conversation');
  }

  redirect(`/messages/${newConv.id}`);
}

export async function grantRoomConsent(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const parsedId = z.string().uuid().safeParse(conversationId);
  if (!parsedId.success) redirect('/error?message=Invalid conversation ID');

  const { error } = await supabase.rpc('grant_room_consent', {
    p_conversation_id: conversationId
  });

  if (error) {
    redirect('/error?message=Failed to grant consent');
  }

  revalidatePath(`/messages/${conversationId}`);
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const conversation_id = formData.get('conversation_id') as string;
  const body = formData.get('body') as string;

  const parsedId = z.string().uuid().safeParse(conversation_id);
  if (!parsedId.success) redirect('/error?message=Invalid conversation ID');

  if (!body || body.trim() === '' || body.trim().length > 1000) redirect(`/messages/${conversation_id}?error=Message must be between 1 and 1000 characters`);

  const { error } = await supabase.from('messages').insert({
    conversation_id,
    sender_id: user.id,
    body: body.trim()
  });

  if (error) {
    console.error(error);
    redirect(`/messages/${conversation_id}?error=Failed to send message`);
  }

  revalidatePath(`/messages/${conversation_id}`);
}

export async function deleteListing(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const parsedId = z.string().uuid().safeParse(listingId);
  if (!parsedId.success) redirect('/error?message=Invalid listing ID');

  const { error } = await supabase.from('listings').delete().eq('id', listingId).eq('seller_id', user.id);

  if (error) {
    redirect('/error?message=Failed to delete listing');
  }

  revalidatePath('/', 'layout');
  redirect('/profile?message=Listing deleted successfully');
}

export async function markAsSold(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const parsedId = z.string().uuid().safeParse(listingId);
  if (!parsedId.success) redirect('/error?message=Invalid listing ID');

  const { error } = await supabase.from('listings').update({ status: 'sold' }).eq('id', listingId).eq('seller_id', user.id);

  if (error) {
    redirect('/error?message=Failed to update listing');
  }

  revalidatePath('/', 'layout');
  redirect(`/listing/${listingId}`);
}

export async function signOutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
