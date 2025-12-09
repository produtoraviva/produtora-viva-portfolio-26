-- Fix security issues: Restrict fotofacil_coupons visibility
DROP POLICY IF EXISTS "Anyone can validate coupons" ON fotofacil_coupons;

-- Create a more restrictive policy that only allows validation of specific coupon codes (via edge functions)
-- The actual coupon validation should happen server-side
CREATE POLICY "Restrict coupon browsing" ON fotofacil_coupons
  FOR SELECT
  USING (is_admin_session());

-- Update fotofacil_customers policies to be more restrictive
-- Remove the overly permissive insert policy
DROP POLICY IF EXISTS "Service can insert customers" ON fotofacil_customers;

-- fotofacil_orders already has proper policies, but let's ensure service updates are restricted
-- The webhook handles updates via service role, so this is okay

-- Create event quantity discounts table for progressive discounts
CREATE TABLE IF NOT EXISTS public.fotofacil_event_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.fotofacil_events(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, min_quantity)
);

-- Enable RLS
ALTER TABLE public.fotofacil_event_discounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view event discounts" ON fotofacil_event_discounts
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage event discounts" ON fotofacil_event_discounts
  FOR ALL
  USING (is_admin_session())
  WITH CHECK (is_admin_session());

-- Create trigger for updated_at
CREATE TRIGGER update_fotofacil_event_discounts_updated_at
  BEFORE UPDATE ON fotofacil_event_discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();