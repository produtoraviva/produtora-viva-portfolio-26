-- Create a temporary media table for uploaded files that aren't portfolio items yet
CREATE TABLE IF NOT EXISTS public.temp_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  file_size BIGINT,
  dimensions JSONB,
  uploaded_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on temp_media
ALTER TABLE public.temp_media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for temp_media
CREATE POLICY "Admins can manage temp media" ON public.temp_media
FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Update portfolio_items to make category nullable temporarily for temp entries
-- This will be handled in the application logic instead