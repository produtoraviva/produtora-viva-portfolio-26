-- Add column for "Outros Trabalhos" section on homepage
ALTER TABLE public.portfolio_items 
ADD COLUMN IF NOT EXISTS other_works_featured boolean NOT NULL DEFAULT false;