-- Add slide_duration column to homepage_backgrounds table
ALTER TABLE public.homepage_backgrounds 
ADD COLUMN slide_duration INTEGER DEFAULT 5;