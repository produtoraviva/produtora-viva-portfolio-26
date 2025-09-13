-- Create storage buckets for media files
INSERT INTO storage.buckets (id, name, public) VALUES 
('portfolio-media', 'portfolio-media', true),
('portfolio-thumbnails', 'portfolio-thumbnails', true);

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio items table
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('casamento', 'aniversario', 'corporativo', 'familia')),
  subcategory TEXT,
  publish_status TEXT NOT NULL DEFAULT 'draft' CHECK (publish_status IN ('draft', 'published', 'hidden')),
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  location TEXT,
  date_taken DATE,
  file_size BIGINT,
  dimensions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio edit history table
CREATE TABLE public.portfolio_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_item_id UUID REFERENCES public.portfolio_items(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'reorder')),
  previous_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_edit_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_users (only admins can access)
CREATE POLICY "Admin users can view all admin users" ON public.admin_users
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admin users can update their own data" ON public.admin_users
  FOR UPDATE USING (auth.uid() = id);

-- RLS policies for portfolio_items (public read, admin write)
CREATE POLICY "Anyone can view published portfolio items" ON public.portfolio_items
  FOR SELECT USING (publish_status = 'published');

CREATE POLICY "Admins can view all portfolio items" ON public.portfolio_items
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can insert portfolio items" ON public.portfolio_items
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can update portfolio items" ON public.portfolio_items
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can delete portfolio items" ON public.portfolio_items
  FOR DELETE USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- RLS policies for portfolio_edit_history (admin only)
CREATE POLICY "Admins can view edit history" ON public.portfolio_edit_history
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can insert edit history" ON public.portfolio_edit_history
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- Storage policies for portfolio media
CREATE POLICY "Anyone can view portfolio media" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-media');

CREATE POLICY "Admins can upload portfolio media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio-media' AND 
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

CREATE POLICY "Admins can update portfolio media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio-media' AND 
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

CREATE POLICY "Admins can delete portfolio media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio-media' AND 
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

-- Storage policies for thumbnails
CREATE POLICY "Anyone can view portfolio thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-thumbnails');

CREATE POLICY "Admins can upload portfolio thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio-thumbnails' AND 
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

CREATE POLICY "Admins can update portfolio thumbnails" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio-thumbnails' AND 
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

CREATE POLICY "Admins can delete portfolio thumbnails" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio-thumbnails' AND 
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log portfolio changes
CREATE OR REPLACE FUNCTION public.log_portfolio_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.portfolio_edit_history (portfolio_item_id, admin_user_id, action, new_data)
    VALUES (NEW.id, auth.uid(), 'create', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.portfolio_edit_history (portfolio_item_id, admin_user_id, action, previous_data, new_data)
    VALUES (NEW.id, auth.uid(), 'update', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.portfolio_edit_history (portfolio_item_id, admin_user_id, action, previous_data)
    VALUES (OLD.id, auth.uid(), 'delete', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for logging changes
CREATE TRIGGER log_portfolio_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.log_portfolio_change();

-- Insert a default admin user (password: admin123456)
INSERT INTO public.admin_users (email, password_hash, full_name)
VALUES ('admin@portfolio.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/cIFJlwtlO0zQQZXLG', 'Administrador');

-- Create indexes for better performance
CREATE INDEX idx_portfolio_items_category ON public.portfolio_items(category);
CREATE INDEX idx_portfolio_items_publish_status ON public.portfolio_items(publish_status);
CREATE INDEX idx_portfolio_items_display_order ON public.portfolio_items(display_order);
CREATE INDEX idx_portfolio_items_created_at ON public.portfolio_items(created_at);
CREATE INDEX idx_portfolio_edit_history_created_at ON public.portfolio_edit_history(created_at);
CREATE INDEX idx_portfolio_edit_history_portfolio_item_id ON public.portfolio_edit_history(portfolio_item_id);