-- Create enum types for portfolio items
CREATE TYPE media_type AS ENUM ('photo', 'video');
CREATE TYPE publish_status AS ENUM ('draft', 'published', 'hidden');
CREATE TYPE client_type AS ENUM ('casamento', 'aniversario', 'corporativo', 'familia');

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create portfolio items table
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  media_type media_type NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category client_type NOT NULL,
  subcategory TEXT,
  publish_status publish_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  location TEXT,
  date_taken DATE,
  file_size BIGINT,
  dimensions JSONB, -- {width: number, height: number}
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create edit history table for undo functionality
CREATE TABLE public.portfolio_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_item_id UUID REFERENCES public.portfolio_items(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES public.admin_users(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'reorder'
  previous_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage buckets for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-media', 'portfolio-media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-thumbnails', 'portfolio-thumbnails', true);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_edit_history ENABLE ROW LEVEL SECURITY;

-- Create policies for admin users (only authenticated admin users can access)
CREATE POLICY "Admin users can view own profile" ON public.admin_users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admin users can update own profile" ON public.admin_users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Create policies for portfolio items (admin only for CUD, public for read published items)
CREATE POLICY "Anyone can view published portfolio items" ON public.portfolio_items
  FOR SELECT USING (publish_status = 'published');

CREATE POLICY "Authenticated admin users can manage portfolio items" ON public.portfolio_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

-- Create policies for edit history (admin only)
CREATE POLICY "Authenticated admin users can view edit history" ON public.portfolio_edit_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Authenticated admin users can create edit history" ON public.portfolio_edit_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

-- Create storage policies for portfolio media
CREATE POLICY "Anyone can view portfolio media" ON storage.objects
  FOR SELECT USING (bucket_id IN ('portfolio-media', 'portfolio-thumbnails'));

CREATE POLICY "Authenticated admin users can upload portfolio media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('portfolio-media', 'portfolio-thumbnails') AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Authenticated admin users can update portfolio media" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('portfolio-media', 'portfolio-thumbnails') AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Authenticated admin users can delete portfolio media" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('portfolio-media', 'portfolio-thumbnails') AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log portfolio changes
CREATE OR REPLACE FUNCTION public.log_portfolio_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.portfolio_edit_history (portfolio_item_id, admin_user_id, action, previous_data)
    VALUES (OLD.id, auth.uid(), 'delete', to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.portfolio_edit_history (portfolio_item_id, admin_user_id, action, previous_data, new_data)
    VALUES (NEW.id, auth.uid(), 'update', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.portfolio_edit_history (portfolio_item_id, admin_user_id, action, new_data)
    VALUES (NEW.id, auth.uid(), 'create', to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for logging changes
CREATE TRIGGER log_portfolio_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION public.log_portfolio_change();

-- Insert admin user (password: admin123456)
INSERT INTO public.admin_users (email, password_hash, full_name)
VALUES ('admin@portfolio.com', '$2b$10$rQ9.KzPf8l4uGj8F5xJ5vO8xvT6Kq2Jh4mF3sL9wN7dR5cE1gH6yW', 'Administrador');

-- Create indexes for better performance
CREATE INDEX idx_portfolio_items_category ON public.portfolio_items(category);
CREATE INDEX idx_portfolio_items_status ON public.portfolio_items(publish_status);
CREATE INDEX idx_portfolio_items_featured ON public.portfolio_items(is_featured);
CREATE INDEX idx_portfolio_items_order ON public.portfolio_items(display_order);
CREATE INDEX idx_portfolio_edit_history_item ON public.portfolio_edit_history(portfolio_item_id);
CREATE INDEX idx_portfolio_edit_history_date ON public.portfolio_edit_history(created_at);