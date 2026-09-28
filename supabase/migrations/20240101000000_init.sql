-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  hostel_block text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.private_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_number text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id),
  title text NOT NULL CHECK (char_length(title) > 0),
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  condition text NOT NULL,
  photo_urls text[] NOT NULL CHECK (array_length(photo_urls, 1) > 0),
  exchange_method text NOT NULL, 
  preferred_time text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_consent_given boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(listing_id, buyer_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) > 0),
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Storage Setup
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-photos', 'listing-photos', true) ON CONFLICT DO NOTHING;

-- 3. Triggers for updated_at and auto-profile
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_private_profiles_modtime BEFORE UPDATE ON public.private_profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_listings_modtime BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email NOT LIKE '%@srmist.edu.in' THEN
    RAISE EXCEPTION 'Only SRM students (@srmist.edu.in) can sign up.';
  END IF;
  
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  INSERT INTO public.private_profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Secure Functions
-- Create conversation (SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.create_conversation(p_listing_id uuid, p_buyer_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_seller_id uuid;
  v_conversation_id uuid;
BEGIN
  SELECT seller_id INTO v_seller_id FROM public.listings WHERE id = p_listing_id AND status = 'available';
  IF NOT FOUND THEN RAISE EXCEPTION 'Listing not found or not available'; END IF;
  IF v_seller_id = p_buyer_id THEN RAISE EXCEPTION 'Cannot start conversation with yourself'; END IF;

  INSERT INTO public.conversations (listing_id, buyer_id, seller_id)
  VALUES (p_listing_id, p_buyer_id, v_seller_id)
  ON CONFLICT (listing_id, buyer_id) DO UPDATE SET created_at = EXCLUDED.created_at
  RETURNING id INTO v_conversation_id;

  RETURN v_conversation_id;
END;
$$;

-- Reveal Room Details (SECURITY DEFINER to read private_profiles safely)
-- Note: Requires SECURITY DEFINER to bypass RLS on private_profiles for the buyer,
-- but strictly validates conversation membership and seller consent.
CREATE OR REPLACE FUNCTION public.reveal_room_details(p_conversation_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_conv public.conversations%ROWTYPE;
  v_room text;
BEGIN
  -- Verify caller is logged in
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Fetch conversation
  SELECT * INTO v_conv FROM public.conversations WHERE id = p_conversation_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  -- Verify participation
  IF auth.uid() != v_conv.buyer_id AND auth.uid() != v_conv.seller_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Check consent
  IF NOT v_conv.seller_consent_given THEN
    RAISE EXCEPTION 'Seller has not granted consent to reveal room details';
  END IF;

  -- Fetch room from private_profiles
  SELECT room_number INTO v_room FROM public.private_profiles WHERE id = v_conv.seller_id;
  
  RETURN v_room;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.reveal_room_details(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reveal_room_details(uuid) TO authenticated;


-- Grant Seller Consent (SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.grant_room_consent(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_seller_id uuid;
BEGIN
  SELECT seller_id INTO v_seller_id FROM public.conversations WHERE id = p_conversation_id;
  IF auth.uid() != v_seller_id THEN
    RAISE EXCEPTION 'Only the seller can grant consent';
  END IF;

  UPDATE public.conversations SET seller_consent_given = true WHERE id = p_conversation_id;
END;
$$;

-- 5. Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles (Public)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Private Profiles
CREATE POLICY "Users can view own private profile" ON public.private_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own private profile" ON public.private_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own private profile" ON public.private_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Listings
CREATE POLICY "Listings viewable by everyone" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Users insert own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users update own listings" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users delete own listings" ON public.listings FOR DELETE USING (auth.uid() = seller_id);

-- Conversations
CREATE POLICY "Users view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers insert conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers can update consent" ON public.conversations FOR UPDATE USING (auth.uid() = seller_id);

-- Messages
CREATE POLICY "Users view own messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);
CREATE POLICY "Users insert own messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);

-- Storage Policies for listing-photos
DROP POLICY IF EXISTS "Public view access for listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

CREATE POLICY "Public view access for listing photos" ON storage.objects FOR SELECT USING (bucket_id = 'listing-photos');
CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'listing-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can update own photos" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'listing-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'listing-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Seed Categories
INSERT INTO public.categories (name) VALUES 
  ('Food'), ('Textbooks'), ('Electronics'), ('Furniture'), 
  ('Clothing'), ('Housing'), ('Rides'), ('Services'), ('Free')
ON CONFLICT (name) DO NOTHING;
