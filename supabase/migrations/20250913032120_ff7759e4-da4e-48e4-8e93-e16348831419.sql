-- Create categories table for managing portfolio categories and subcategories
CREATE TABLE public.portfolio_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, type)
);

-- Create subcategories table
CREATE TABLE public.portfolio_subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.portfolio_categories(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, category_id)
);

-- Add homepage_featured column to portfolio_items for homepage selection
ALTER TABLE public.portfolio_items 
ADD COLUMN homepage_featured BOOLEAN NOT NULL DEFAULT false;

-- Create indexes for better performance
CREATE INDEX idx_portfolio_categories_type ON public.portfolio_categories(type);
CREATE INDEX idx_portfolio_categories_active ON public.portfolio_categories(is_active);
CREATE INDEX idx_portfolio_subcategories_category ON public.portfolio_subcategories(category_id);
CREATE INDEX idx_portfolio_items_homepage_featured ON public.portfolio_items(homepage_featured);

-- Enable RLS for categories
ALTER TABLE public.portfolio_categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS for subcategories
ALTER TABLE public.portfolio_subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (admin can manage, public can read active ones)
CREATE POLICY "Admins can manage categories" 
ON public.portfolio_categories 
FOR ALL 
USING (auth.uid() IN (SELECT id FROM admin_users))
WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Anyone can view active categories" 
ON public.portfolio_categories 
FOR SELECT 
USING (is_active = true);

-- Create policies for subcategories (admin can manage, public can read active ones)
CREATE POLICY "Admins can manage subcategories" 
ON public.portfolio_subcategories 
FOR ALL 
USING (auth.uid() IN (SELECT id FROM admin_users))
WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Anyone can view active subcategories" 
ON public.portfolio_subcategories 
FOR SELECT 
USING (is_active = true);

-- Add triggers for updated_at
CREATE TRIGGER update_portfolio_categories_updated_at
BEFORE UPDATE ON public.portfolio_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_subcategories_updated_at
BEFORE UPDATE ON public.portfolio_subcategories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories and subcategories
INSERT INTO public.portfolio_categories (name, type, display_order) VALUES
('Casamento', 'photo', 1),
('Casamento', 'video', 1),
('Aniversário', 'photo', 2),
('Aniversário', 'video', 2),
('Corporativo', 'photo', 3),
('Corporativo', 'video', 3),
('Família', 'photo', 4),
('Família', 'video', 4);

-- Insert some default subcategories
INSERT INTO public.portfolio_subcategories (name, category_id, display_order)
SELECT 'Cerimônia', id, 1 FROM public.portfolio_categories WHERE name = 'Casamento' AND type = 'photo'
UNION ALL
SELECT 'Festa', id, 2 FROM public.portfolio_categories WHERE name = 'Casamento' AND type = 'photo'
UNION ALL
SELECT 'Ensaio', id, 3 FROM public.portfolio_categories WHERE name = 'Casamento' AND type = 'photo'
UNION ALL
SELECT 'Highlight', id, 1 FROM public.portfolio_categories WHERE name = 'Casamento' AND type = 'video'
UNION ALL
SELECT 'Cerimônia', id, 2 FROM public.portfolio_categories WHERE name = 'Casamento' AND type = 'video'
UNION ALL
SELECT 'Festa', id, 3 FROM public.portfolio_categories WHERE name = 'Casamento' AND type = 'video';