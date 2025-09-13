-- Create storage buckets for media files (if they don't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-thumbnails', 'portfolio-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for portfolio media
CREATE POLICY "Anyone can view portfolio media" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-media');

CREATE POLICY "Admins can upload portfolio media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio-media' AND 
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

CREATE POLICY "Admins can update portfolio media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio-media' AND 
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

CREATE POLICY "Admins can delete portfolio media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio-media' AND 
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

-- Storage policies for thumbnails
CREATE POLICY "Anyone can view portfolio thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-thumbnails');

CREATE POLICY "Admins can upload portfolio thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio-thumbnails' AND 
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

CREATE POLICY "Admins can update portfolio thumbnails" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio-thumbnails' AND 
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

CREATE POLICY "Admins can delete portfolio thumbnails" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio-thumbnails' AND 
    auth.uid() IN (SELECT id FROM public.admin_users)
  );