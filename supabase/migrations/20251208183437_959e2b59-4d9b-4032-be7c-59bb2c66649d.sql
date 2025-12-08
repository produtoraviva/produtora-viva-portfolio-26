-- Add watermark configuration to a settings table for FotoFacil
-- Insert watermark_url setting if it doesn't exist
INSERT INTO fotofacil_footer_settings (setting_key, setting_value)
VALUES ('watermark_url', '')
ON CONFLICT (setting_key) DO NOTHING;