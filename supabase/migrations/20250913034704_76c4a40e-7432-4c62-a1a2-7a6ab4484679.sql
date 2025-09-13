-- Create storage bucket for portfolio media
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage bucket
CREATE POLICY "Admin can upload portfolio media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM admin_users)
);

CREATE POLICY "Admin can view portfolio media"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM admin_users)
);

CREATE POLICY "Admin can update portfolio media"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM admin_users)
);

CREATE POLICY "Admin can delete portfolio media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'portfolio-media' 
  AND auth.uid() IN (SELECT id FROM admin_users)
);

-- Public access for published media
CREATE POLICY "Public can view portfolio media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'portfolio-media');

-- Update portfolio_categories to allow custom types
ALTER TABLE portfolio_categories 
ALTER COLUMN type DROP NOT NULL;

-- Add a custom_type column for user-defined types
ALTER TABLE portfolio_categories 
ADD COLUMN custom_type text;

-- Create a check constraint to ensure either type or custom_type is set
ALTER TABLE portfolio_categories 
ADD CONSTRAINT check_category_type 
CHECK (
  (type IS NOT NULL AND custom_type IS NULL) OR 
  (type IS NULL AND custom_type IS NOT NULL)
);