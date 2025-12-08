-- Add min_photos column to fotofacil_coupons table for minimum photo quantity requirement
ALTER TABLE public.fotofacil_coupons 
ADD COLUMN IF NOT EXISTS min_photos integer DEFAULT NULL;