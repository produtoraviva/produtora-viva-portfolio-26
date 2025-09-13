-- Create table for homepage backgrounds
CREATE TABLE public.homepage_backgrounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  opacity NUMERIC NOT NULL DEFAULT 0.5 CHECK (opacity >= 0 AND opacity <= 1),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.homepage_backgrounds ENABLE ROW LEVEL SECURITY;

-- Create policies for public viewing
CREATE POLICY "Anyone can view active homepage backgrounds" 
ON public.homepage_backgrounds 
FOR SELECT 
USING (is_active = true);

-- Create policies for admin management
CREATE POLICY "Allow admin operations on homepage backgrounds" 
ON public.homepage_backgrounds 
FOR ALL 
USING (is_admin_session())
WITH CHECK (is_admin_session());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_homepage_backgrounds_updated_at
BEFORE UPDATE ON public.homepage_backgrounds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();