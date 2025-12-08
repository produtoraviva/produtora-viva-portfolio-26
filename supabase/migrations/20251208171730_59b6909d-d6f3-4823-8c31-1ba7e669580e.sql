-- Create table for FotoFacil banners
CREATE TABLE public.fotofacil_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fotofacil_banners ENABLE ROW LEVEL SECURITY;

-- Policies for banners
CREATE POLICY "Anyone can view active banners" 
ON public.fotofacil_banners 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage banners" 
ON public.fotofacil_banners 
FOR ALL 
USING (is_admin_session());

-- Create table for discount coupons
CREATE TABLE public.fotofacil_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  min_order_cents INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fotofacil_coupons ENABLE ROW LEVEL SECURITY;

-- Policies for coupons
CREATE POLICY "Anyone can validate coupons" 
ON public.fotofacil_coupons 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage coupons" 
ON public.fotofacil_coupons 
FOR ALL 
USING (is_admin_session());

-- Add coupon fields to orders
ALTER TABLE public.fotofacil_orders
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.fotofacil_coupons(id),
ADD COLUMN IF NOT EXISTS discount_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_total_cents INTEGER;

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_fotofacil_banners_updated_at
BEFORE UPDATE ON public.fotofacil_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fotofacil_coupons_updated_at
BEFORE UPDATE ON public.fotofacil_coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_fotofacil_coupons_code ON public.fotofacil_coupons(code);
CREATE INDEX idx_fotofacil_banners_active ON public.fotofacil_banners(is_active, display_order);