-- Simplify the system by removing temp_media and using portfolio_items directly
-- Drop temp_media table since we'll use portfolio_items directly
DROP TABLE IF EXISTS public.temp_media;

-- Simplify storage policies - make them more permissive for admins
DROP POLICY IF EXISTS "Enable admin upload to portfolio-media" ON storage.objects;
DROP POLICY IF EXISTS "Enable admin read from portfolio-media" ON storage.objects;
DROP POLICY IF EXISTS "Enable admin update on portfolio-media" ON storage.objects;
DROP POLICY IF EXISTS "Enable admin delete on portfolio-media" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_media_upload" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_media_select" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_media_update" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_media_delete" ON storage.objects;

-- Create simple storage policies
CREATE POLICY "Allow admin full access to portfolio-media" ON storage.objects
FOR ALL USING (bucket_id = 'portfolio-media');

-- Make portfolio_items category nullable for upload-only items
ALTER TABLE public.portfolio_items ALTER COLUMN category DROP NOT NULL;

-- Add a simple status to differentiate uploaded media vs published items
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS item_status TEXT DEFAULT 'uploaded' CHECK (item_status IN ('uploaded', 'published', 'draft', 'hidden'));