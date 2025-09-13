-- Create storage policies for portfolio-media bucket
CREATE POLICY "Allow admin to upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM public.admin_users)
);

CREATE POLICY "Allow admin to view files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM public.admin_users)
);

CREATE POLICY "Allow admin to update files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM public.admin_users)
);

CREATE POLICY "Allow admin to delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM public.admin_users)
);

CREATE POLICY "Allow public to view files" ON storage.objects
FOR SELECT USING (bucket_id = 'portfolio-media');