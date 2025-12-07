import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface SiteConfig {
  company_name: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  secondary_phone: string;
  whatsapp_number: string;
  whatsapp_international: string;
  address: string;
}

const defaultConfig: SiteConfig = {
  company_name: 'Rubens Photofilm',
  logo_url: '',
  contact_email: '',
  contact_phone: '',
  secondary_phone: '',
  whatsapp_number: '',
  whatsapp_international: '',
  address: '',
};

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['company_name', 'logo_url', 'contact_email', 'contact_phone', 'secondary_phone', 'whatsapp_number', 'whatsapp_international', 'address']);

      if (fetchError) {
        console.error('Error loading site config:', fetchError);
        setError(fetchError.message);
        return;
      }

      const configMap: Partial<SiteConfig> = {};
      (data || []).forEach((setting) => {
        configMap[setting.setting_key as keyof SiteConfig] = setting.setting_value;
      });

      setConfig(prevConfig => ({
        ...prevConfig,
        ...configMap
      }));
    } catch (err) {
      console.error('Error loading site config:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return { config, loading, error, refetch: loadConfig };
}
