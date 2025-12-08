-- FOTOFÁCIL: Sistema de venda de fotos

-- Categorias
CREATE TABLE public.fotofacil_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Eventos
CREATE TABLE public.fotofacil_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.fotofacil_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  event_date date,
  location text,
  default_price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  cover_url text,
  status text NOT NULL DEFAULT 'draft',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fotos
CREATE TABLE public.fotofacil_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.fotofacil_events(id) ON DELETE CASCADE,
  title text,
  description text,
  url text NOT NULL,
  thumb_url text,
  width integer,
  height integer,
  size_bytes bigint,
  price_cents integer,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clientes
CREATE TABLE public.fotofacil_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  cpf_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Pedidos
CREATE TABLE public.fotofacil_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.fotofacil_customers(id),
  total_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'created',
  mercadopago_order_id text,
  mercadopago_payment_id text,
  qr_code text,
  qr_code_base64 text,
  pix_copia_cola text,
  delivery_token text,
  delivery_expires_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Itens do pedido
CREATE TABLE public.fotofacil_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.fotofacil_orders(id) ON DELETE CASCADE,
  photo_id uuid REFERENCES public.fotofacil_photos(id),
  title_snapshot text,
  price_cents_snapshot integer,
  created_at timestamptz DEFAULT now()
);

-- Indices
CREATE INDEX idx_fotofacil_events_category ON public.fotofacil_events(category_id);
CREATE INDEX idx_fotofacil_photos_event ON public.fotofacil_photos(event_id);
CREATE INDEX idx_fotofacil_orders_mp ON public.fotofacil_orders(mercadopago_order_id);
CREATE INDEX idx_fotofacil_orders_token ON public.fotofacil_orders(delivery_token);
CREATE INDEX idx_fotofacil_orders_customer ON public.fotofacil_orders(customer_id);

-- Enable RLS
ALTER TABLE public.fotofacil_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotofacil_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotofacil_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotofacil_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotofacil_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotofacil_order_items ENABLE ROW LEVEL SECURITY;

-- Public read policies for categories, events, photos
CREATE POLICY "Anyone can view active categories" ON public.fotofacil_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active events" ON public.fotofacil_events FOR SELECT USING (is_active = true AND status = 'published');
CREATE POLICY "Anyone can view active photos" ON public.fotofacil_photos FOR SELECT USING (is_active = true);

-- Admin policies
CREATE POLICY "Admins can manage categories" ON public.fotofacil_categories FOR ALL USING (is_admin_session()) WITH CHECK (is_admin_session());
CREATE POLICY "Admins can manage events" ON public.fotofacil_events FOR ALL USING (is_admin_session()) WITH CHECK (is_admin_session());
CREATE POLICY "Admins can manage photos" ON public.fotofacil_photos FOR ALL USING (is_admin_session()) WITH CHECK (is_admin_session());
CREATE POLICY "Admins can view customers" ON public.fotofacil_customers FOR SELECT USING (is_admin_session());
CREATE POLICY "Admins can view orders" ON public.fotofacil_orders FOR SELECT USING (is_admin_session());
CREATE POLICY "Admins can view order items" ON public.fotofacil_order_items FOR SELECT USING (is_admin_session());

-- Service role insert policies (for edge functions)
CREATE POLICY "Service can insert customers" ON public.fotofacil_customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert orders" ON public.fotofacil_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update orders" ON public.fotofacil_orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Service can insert order items" ON public.fotofacil_order_items FOR INSERT WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_fotofacil_categories_updated_at BEFORE UPDATE ON public.fotofacil_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fotofacil_events_updated_at BEFORE UPDATE ON public.fotofacil_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fotofacil_photos_updated_at BEFORE UPDATE ON public.fotofacil_photos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fotofacil_orders_updated_at BEFORE UPDATE ON public.fotofacil_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for fotofacil
INSERT INTO storage.buckets (id, name, public) VALUES ('fotofacil', 'fotofacil', true);