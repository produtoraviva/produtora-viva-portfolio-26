-- Add slide_duration and opacity columns to fotofacil_banners
ALTER TABLE public.fotofacil_banners 
ADD COLUMN IF NOT EXISTS slide_duration INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS opacity NUMERIC DEFAULT 1.0;

-- Create fotofacil_footer_settings table
CREATE TABLE IF NOT EXISTS public.fotofacil_footer_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fotofacil_footer_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view footer settings" 
ON public.fotofacil_footer_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage footer settings" 
ON public.fotofacil_footer_settings 
FOR ALL 
USING (is_admin_session())
WITH CHECK (is_admin_session());

-- Insert default footer settings
INSERT INTO public.fotofacil_footer_settings (setting_key, setting_value) VALUES
  ('brand_name', 'FOTOFÁCIL'),
  ('brand_description', 'Sua plataforma de fotos de eventos. Encontre e compre suas fotos de forma rápida e segura.'),
  ('contact_email', 'contato@fotofacil.com'),
  ('contact_phone', '+55 (11) 99999-9999'),
  ('show_trust_badges', 'true'),
  ('instagram_url', ''),
  ('whatsapp_url', '')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_fotofacil_footer_settings_updated_at
BEFORE UPDATE ON public.fotofacil_footer_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();