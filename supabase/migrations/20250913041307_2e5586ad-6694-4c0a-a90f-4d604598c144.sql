-- Fix the upload policy that was missing WITH CHECK condition
DROP POLICY IF EXISTS "portfolio_media_upload" ON storage.objects;

CREATE POLICY "portfolio_media_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM public.admin_users)
);