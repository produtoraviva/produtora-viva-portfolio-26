-- Criar tabela para configurações gerais do site
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Allow admin operations on site settings" 
ON public.site_settings 
FOR ALL 
USING (is_admin_session())
WITH CHECK (is_admin_session());

-- Criar trigger para updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO public.site_settings (setting_key, setting_value, description) VALUES
('contact_phone', '(45) 99988-7766', 'Número de telefone para contato'),
('contact_email', 'info@produtoraviva.com', 'Email para contato'),
('whatsapp_number', '5545999887766', 'Número do WhatsApp (formato internacional)'),
('instagram_url', 'https://instagram.com/produtoraviva', 'URL do Instagram'),
('facebook_url', 'https://facebook.com/produtoraviva', 'URL do Facebook'),
('youtube_url', '', 'URL do YouTube'),
('tiktok_url', '', 'URL do TikTok'),
('linkedin_url', '', 'URL do LinkedIn');