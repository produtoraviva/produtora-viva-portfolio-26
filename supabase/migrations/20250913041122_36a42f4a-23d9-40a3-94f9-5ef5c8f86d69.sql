-- Clean up all storage policies for portfolio-media bucket
DROP POLICY IF EXISTS "Admin can delete portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Admin can view portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Enable admin upload to portfolio-media" ON storage.objects;
DROP POLICY IF EXISTS "Enable admin read from portfolio-media" ON storage.objects;
DROP POLICY IF EXISTS "Enable admin update on portfolio-media" ON storage.objects;
DROP POLICY IF EXISTS "Enable admin delete on portfolio-media" ON storage.objects;

-- Create single clean policies
CREATE POLICY "portfolio_media_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM public.admin_users)
);

CREATE POLICY "portfolio_media_select" ON storage.objects
FOR SELECT USING (bucket_id = 'portfolio-media');

CREATE POLICY "portfolio_media_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM public.admin_users)
);

CREATE POLICY "portfolio_media_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM public.admin_users)
);