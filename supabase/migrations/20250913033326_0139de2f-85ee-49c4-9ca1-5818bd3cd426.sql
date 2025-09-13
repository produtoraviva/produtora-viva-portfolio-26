-- Update portfolio_items table to fix category structure
-- First, add a new column for the proper category (photo/video)
ALTER TABLE public.portfolio_items 
ADD COLUMN IF NOT EXISTS category_type text;

-- Update existing records to set category_type based on media_type
UPDATE public.portfolio_items 
SET category_type = media_type 
WHERE category_type IS NULL;

-- Rename current category column to subcategory_old temporarily
ALTER TABLE public.portfolio_items 
RENAME COLUMN category TO subcategory_old;

-- Add new category column as UUID to reference portfolio_categories
ALTER TABLE public.portfolio_items 
ADD COLUMN category uuid;

-- Update the category column to be NOT NULL after we populate it
-- We'll do this after updating the categories table structure

-- Update portfolio_categories to have photo/video as main categories
-- Clear existing categories and insert new ones
DELETE FROM public.portfolio_categories WHERE true;

-- Insert main categories (photo and video)
INSERT INTO public.portfolio_categories (id, name, type, display_order, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Foto', 'photo', 0, true),
('550e8400-e29b-41d4-a716-446655440002', 'Vídeo', 'video', 1, true);

-- Update portfolio_subcategories to reference new categories
-- Clear existing subcategories and insert new ones
DELETE FROM public.portfolio_subcategories WHERE true;

-- Insert photo subcategories
INSERT INTO public.portfolio_subcategories (id, name, category_id, display_order, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Casamento', '550e8400-e29b-41d4-a716-446655440001', 0, true),
('660e8400-e29b-41d4-a716-446655440002', 'Aniversário', '550e8400-e29b-41d4-a716-446655440001', 1, true),
('660e8400-e29b-41d4-a716-446655440003', 'Corporativo', '550e8400-e29b-41d4-a716-446655440001', 2, true),
('660e8400-e29b-41d4-a716-446655440004', 'Família', '550e8400-e29b-41d4-a716-446655440001', 3, true);

-- Insert video subcategories
INSERT INTO public.portfolio_subcategories (id, name, category_id, display_order, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440005', 'Casamento', '550e8400-e29b-41d4-a716-446655440002', 0, true),
('660e8400-e29b-41d4-a716-446655440006', 'Aniversário', '550e8400-e29b-41d4-a716-446655440002', 1, true),
('660e8400-e29b-41d4-a716-446655440007', 'Corporativo', '550e8400-e29b-41d4-a716-446655440002', 2, true),
('660e8400-e29b-41d4-a716-446655440008', 'Família', '550e8400-e29b-41d4-a716-446655440002', 3, true);

-- Update portfolio_items to use new category structure
UPDATE public.portfolio_items 
SET category = CASE 
  WHEN category_type = 'photo' THEN '550e8400-e29b-41d4-a716-446655440001'
  WHEN category_type = 'video' THEN '550e8400-e29b-41d4-a716-446655440002'
  ELSE '550e8400-e29b-41d4-a716-446655440001'
END;

-- Set subcategory based on old category values
UPDATE public.portfolio_items 
SET subcategory = CASE 
  WHEN subcategory_old = 'casamento' AND category_type = 'photo' THEN '660e8400-e29b-41d4-a716-446655440001'
  WHEN subcategory_old = 'aniversario' AND category_type = 'photo' THEN '660e8400-e29b-41d4-a716-446655440002'
  WHEN subcategory_old = 'corporativo' AND category_type = 'photo' THEN '660e8400-e29b-41d4-a716-446655440003'
  WHEN subcategory_old = 'familia' AND category_type = 'photo' THEN '660e8400-e29b-41d4-a716-446655440004'
  WHEN subcategory_old = 'casamento' AND category_type = 'video' THEN '660e8400-e29b-41d4-a716-446655440005'
  WHEN subcategory_old = 'aniversario' AND category_type = 'video' THEN '660e8400-e29b-41d4-a716-446655440006'
  WHEN subcategory_old = 'corporativo' AND category_type = 'video' THEN '660e8400-e29b-41d4-a716-446655440007'
  WHEN subcategory_old = 'familia' AND category_type = 'video' THEN '660e8400-e29b-41d4-a716-446655440008'
  ELSE NULL
END;

-- Make category NOT NULL now that it's populated
ALTER TABLE public.portfolio_items 
ALTER COLUMN category SET NOT NULL;

-- Drop temporary columns
ALTER TABLE public.portfolio_items 
DROP COLUMN subcategory_old,
DROP COLUMN category_type;

-- Add foreign key constraints
ALTER TABLE public.portfolio_items 
ADD CONSTRAINT fk_portfolio_items_category 
FOREIGN KEY (category) REFERENCES public.portfolio_categories(id);

ALTER TABLE public.portfolio_items 
ADD CONSTRAINT fk_portfolio_items_subcategory 
FOREIGN KEY (subcategory) REFERENCES public.portfolio_subcategories(id);