import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface SiteConfig {
  company_name: string;
  logo_url: string;
}

const defaultConfig: SiteConfig = {
  company_name: 'Rubens Photofilm',
  logo_url: '',
};

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['company_name', 'logo_url']);

      if (error) {
        console.error('Error loading site config:', error);
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
    } catch (error) {
      console.error('Error loading site config:', error);
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, refetch: loadConfig };
}
