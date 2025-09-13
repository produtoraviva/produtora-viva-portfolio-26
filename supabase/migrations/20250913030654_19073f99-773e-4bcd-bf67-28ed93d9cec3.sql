-- Create storage buckets for media files (if they don't exist)
INSERT INTO storage.buckets (id, name, public) 
SELECT 'portfolio-media', 'portfolio-media', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'portfolio-media');

INSERT INTO storage.buckets (id, name, public) 
SELECT 'portfolio-thumbnails', 'portfolio-thumbnails', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'portfolio-thumbnails');

-- Storage policies for portfolio media
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Anyone can view portfolio media'
  ) THEN
    CREATE POLICY "Anyone can view portfolio media" ON storage.objects
      FOR SELECT USING (bucket_id = 'portfolio-media');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Admins can upload portfolio media'
  ) THEN
    CREATE POLICY "Admins can upload portfolio media" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'portfolio-media' AND 
        auth.uid() IN (SELECT id FROM public.admin_users)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Admins can update portfolio media'
  ) THEN
    CREATE POLICY "Admins can update portfolio media" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'portfolio-media' AND 
        auth.uid() IN (SELECT id FROM public.admin_users)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Admins can delete portfolio media'
  ) THEN
    CREATE POLICY "Admins can delete portfolio media" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'portfolio-media' AND 
        auth.uid() IN (SELECT id FROM public.admin_users)
      );
  END IF;
END $$;

-- Storage policies for thumbnails
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Anyone can view portfolio thumbnails'
  ) THEN
    CREATE POLICY "Anyone can view portfolio thumbnails" ON storage.objects
      FOR SELECT USING (bucket_id = 'portfolio-thumbnails');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Admins can upload portfolio thumbnails'
  ) THEN
    CREATE POLICY "Admins can upload portfolio thumbnails" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'portfolio-thumbnails' AND 
        auth.uid() IN (SELECT id FROM public.admin_users)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Admins can update portfolio thumbnails'
  ) THEN
    CREATE POLICY "Admins can update portfolio thumbnails" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'portfolio-thumbnails' AND 
        auth.uid() IN (SELECT id FROM public.admin_users)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Admins can delete portfolio thumbnails'
  ) THEN
    CREATE POLICY "Admins can delete portfolio thumbnails" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'portfolio-thumbnails' AND 
        auth.uid() IN (SELECT id FROM public.admin_users)
      );
  END IF;
END $$;