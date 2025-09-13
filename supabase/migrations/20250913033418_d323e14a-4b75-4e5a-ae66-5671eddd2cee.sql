-- Fix the subcategory column type to be uuid
-- First, drop the foreign key constraint if it exists
ALTER TABLE public.portfolio_items 
DROP CONSTRAINT IF EXISTS fk_portfolio_items_subcategory;

-- Change subcategory column type to uuid
ALTER TABLE public.portfolio_items 
ALTER COLUMN subcategory TYPE uuid USING subcategory::uuid;

-- Now add the foreign key constraint
ALTER TABLE public.portfolio_items 
ADD CONSTRAINT fk_portfolio_items_subcategory 
FOREIGN KEY (subcategory) REFERENCES public.portfolio_subcategories(id);