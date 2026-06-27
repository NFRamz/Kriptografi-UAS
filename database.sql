-- ==============================================================================
-- DigiProof: Complete Database Schema
-- Run this script in the Supabase SQL Editor
-- ==============================================================================

-- ==============================================================================
-- MODULE 1: AUTHENTICATION SCHEMA
-- ==============================================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'creator' CHECK (role IN ('admin', 'creator', 'verifier')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING ( 
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 3. Create Trigger to Auto-create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Create function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ==============================================================================
-- MODULE 7 & 8: PROTECTED ASSETS, STORAGE, AND VERIFICATION
-- ==============================================================================

-- 5. Create Storage Bucket for Protected Assets  
INSERT INTO storage.buckets (id, name, public) VALUES ('protected-assets', 'protected-assets', true) ON CONFLICT DO NOTHING;  
  
CREATE POLICY "Public can view protected assets" ON storage.objects FOR SELECT USING (bucket_id = 'protected-assets');  
CREATE POLICY "Authenticated users can upload protected assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'protected-assets'); 
  
-- 6. Assets Tables  
CREATE TABLE IF NOT EXISTS public.assets ( 
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, 
  title TEXT NOT NULL, 
  description TEXT, 
  category TEXT, 
  original_file_path TEXT NOT NULL, 
  created_at TIMESTAMPTZ DEFAULT NOW() 
);  
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;  
CREATE POLICY "Users can view own assets" ON public.assets FOR SELECT USING ( auth.uid() = user_id );  
CREATE POLICY "Users can insert own assets" ON public.assets FOR INSERT WITH CHECK ( auth.uid() = user_id );  
  
CREATE TABLE IF NOT EXISTS public.asset_metadata ( 
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE, 
  owner_name TEXT NOT NULL, 
  copyright_note TEXT, 
  verification_hash TEXT, 
  encrypted_metadata TEXT NOT NULL, 
  created_at TIMESTAMPTZ DEFAULT NOW() 
);  
ALTER TABLE public.asset_metadata ENABLE ROW LEVEL SECURITY;  
CREATE POLICY "Users can view own asset metadata" ON public.asset_metadata FOR SELECT USING ( EXISTS ( SELECT 1 FROM public.assets WHERE id = asset_id AND user_id = auth.uid() ) );  
CREATE POLICY "Users can insert own asset metadata" ON public.asset_metadata FOR INSERT WITH CHECK ( EXISTS ( SELECT 1 FROM public.assets WHERE id = asset_id AND user_id = auth.uid() ) );  
  
CREATE TABLE IF NOT EXISTS public.protected_assets ( 
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE, 
  stego_image_path TEXT NOT NULL, 
  created_at TIMESTAMPTZ DEFAULT NOW() 
);  
ALTER TABLE public.protected_assets ENABLE ROW LEVEL SECURITY;  
CREATE POLICY "Public can view protected assets" ON public.protected_assets FOR SELECT USING (true);  
CREATE POLICY "Users can insert own protected assets" ON public.protected_assets FOR INSERT WITH CHECK ( EXISTS ( SELECT 1 FROM public.assets WHERE id = asset_id AND user_id = auth.uid() ) );  
  
-- 7. Original Assets Bucket  
INSERT INTO storage.buckets (id, name, public) VALUES ('original-assets', 'original-assets', false) ON CONFLICT DO NOTHING;  
CREATE POLICY "Authenticated users can upload original assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'original-assets');  
CREATE POLICY "Users can view own original assets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'original-assets' AND (storage.foldername(name))[1] = auth.uid()::text); 
  
-- 8. Verification Logs  
CREATE TABLE IF NOT EXISTS public.verification_logs ( 
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
  verifier_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, 
  uploaded_image_url TEXT, 
  status TEXT NOT NULL, 
  extracted_metadata JSONB, 
  created_at TIMESTAMPTZ DEFAULT NOW() 
);  
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;  
CREATE POLICY "Users can insert verification logs" ON public.verification_logs FOR INSERT WITH CHECK (auth.uid() = verifier_id);  
CREATE POLICY "Users can view own verification logs" ON public.verification_logs FOR SELECT USING (auth.uid() = verifier_id);  
  
-- 9. Buckets for Verification  
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-uploads', 'verification-uploads', false) ON CONFLICT DO NOTHING;  
CREATE POLICY "Users can upload to verification" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'verification-uploads');  

INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false) ON CONFLICT DO NOTHING;  
CREATE POLICY "Users can upload to reports" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reports');  
CREATE POLICY "Users can view own reports" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'reports'); 
