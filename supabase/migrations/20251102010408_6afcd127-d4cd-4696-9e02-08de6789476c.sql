-- Add whatsapp_international setting
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES (
  'whatsapp_international',
  '',
  'Número do WhatsApp internacional para Paraguay e outros países (formato: código do país + DDD + número)'
)
ON CONFLICT (setting_key) DO NOTHING;