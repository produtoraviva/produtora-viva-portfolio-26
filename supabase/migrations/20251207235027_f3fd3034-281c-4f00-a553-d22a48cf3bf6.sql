-- Add public SELECT policy for non-sensitive site settings (company name, logo, contact info)
CREATE POLICY "Anyone can view public site settings"
ON public.site_settings
FOR SELECT
USING (setting_key IN ('company_name', 'logo_url', 'contact_email', 'contact_phone', 'secondary_phone', 'whatsapp_number', 'whatsapp_international', 'address'));