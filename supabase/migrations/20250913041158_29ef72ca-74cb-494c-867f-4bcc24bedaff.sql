-- Insert test media for debugging
INSERT INTO public.temp_media (filename, file_url, media_type, file_size, uploaded_by) 
VALUES 
  ('test-image.jpg', 'https://picsum.photos/800/600', 'photo', 102400, 'd3743515-3e84-4c70-a468-814237d05784'),
  ('test-video.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'video', 5242880, 'd3743515-3e84-4c70-a468-814237d05784');

-- Check current storage policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Drop existing conflicting policies if any
DROP POLICY IF EXISTS "Allow admin to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to view files" ON storage.objects;  
DROP POLICY IF EXISTS "Allow admin to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view files" ON storage.objects;

-- Create correct storage policies
CREATE POLICY "Enable admin upload to portfolio-media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM public.admin_users)
);

CREATE POLICY "Enable admin read from portfolio-media" ON storage.objects
FOR SELECT USING (
  bucket_id = 'portfolio-media' 
  AND (auth.uid() IN (SELECT id FROM public.admin_users) OR bucket_id = 'portfolio-media')
);

CREATE POLICY "Enable admin update on portfolio-media" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM public.admin_users)
);

CREATE POLICY "Enable admin delete on portfolio-media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM public.admin_users)
);