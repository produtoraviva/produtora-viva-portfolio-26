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

-- Update portfolio_categories to have photo/video as main categories
-- Clear existing categories and insert new ones
DELETE FROM public.portfolio_categories WHERE true;

-- Insert main categories (photo and video)
INSERT INTO public.portfolio_categories (id, name, type, display_order, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Foto', 'photo', 0, true),
('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Vídeo', 'video', 1, true);

-- Update portfolio_subcategories to reference new categories
-- Clear existing subcategories and insert new ones
DELETE FROM public.portfolio_subcategories WHERE true;

-- Insert photo subcategories
INSERT INTO public.portfolio_subcategories (id, name, category_id, display_order, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440001'::uuid, 'Casamento', '550e8400-e29b-41d4-a716-446655440001'::uuid, 0, true),
('660e8400-e29b-41d4-a716-446655440002'::uuid, 'Aniversário', '550e8400-e29b-41d4-a716-446655440001'::uuid, 1, true),
('660e8400-e29b-41d4-a716-446655440003'::uuid, 'Corporativo', '550e8400-e29b-41d4-a716-446655440001'::uuid, 2, true),
('660e8400-e29b-41d4-a716-446655440004'::uuid, 'Família', '550e8400-e29b-41d4-a716-446655440001'::uuid, 3, true);

-- Insert video subcategories
INSERT INTO public.portfolio_subcategories (id, name, category_id, display_order, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440005'::uuid, 'Casamento', '550e8400-e29b-41d4-a716-446655440002'::uuid, 0, true),
('660e8400-e29b-41d4-a716-446655440006'::uuid, 'Aniversário', '550e8400-e29b-41d4-a716-446655440002'::uuid, 1, true),
('660e8400-e29b-41d4-a716-446655440007'::uuid, 'Corporativo', '550e8400-e29b-41d4-a716-446655440002'::uuid, 2, true),
('660e8400-e29b-41d4-a716-446655440008'::uuid, 'Família', '550e8400-e29b-41d4-a716-446655440002'::uuid, 3, true);

-- Update portfolio_items to use new category structure with proper UUID casting
UPDATE public.portfolio_items 
SET category = CASE 
  WHEN category_type = 'photo' THEN '550e8400-e29b-41d4-a716-446655440001'::uuid
  WHEN category_type = 'video' THEN '550e8400-e29b-41d4-a716-446655440002'::uuid
  ELSE '550e8400-e29b-41d4-a716-446655440001'::uuid
END;

-- Set subcategory based on old category values with proper UUID casting
UPDATE public.portfolio_items 
SET subcategory = CASE 
  WHEN subcategory_old = 'casamento' AND category_type = 'photo' THEN '660e8400-e29b-41d4-a716-446655440001'::uuid
  WHEN subcategory_old = 'aniversario' AND category_type = 'photo' THEN '660e8400-e29b-41d4-a716-446655440002'::uuid
  WHEN subcategory_old = 'corporativo' AND category_type = 'photo' THEN '660e8400-e29b-41d4-a716-446655440003'::uuid
  WHEN subcategory_old = 'familia' AND category_type = 'photo' THEN '660e8400-e29b-41d4-a716-446655440004'::uuid
  WHEN subcategory_old = 'casamento' AND category_type = 'video' THEN '660e8400-e29b-41d4-a716-446655440005'::uuid
  WHEN subcategory_old = 'aniversario' AND category_type = 'video' THEN '660e8400-e29b-41d4-a716-446655440006'::uuid
  WHEN subcategory_old = 'corporativo' AND category_type = 'video' THEN '660e8400-e29b-41d4-a716-446655440007'::uuid
  WHEN subcategory_old = 'familia' AND category_type = 'video' THEN '660e8400-e29b-41d4-a716-446655440008'::uuid
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