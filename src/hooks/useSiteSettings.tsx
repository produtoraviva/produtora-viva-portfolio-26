import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  contact_phone: string;
  contact_email: string;
  whatsapp_number: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  tiktok_url: string;
  linkedin_url: string;
}

const defaultSettings: SiteSettings = {
  contact_phone: '(45) 99988-7766',
  contact_email: 'info@produtoraviva.com',
  whatsapp_number: '5545999887766',
  instagram_url: 'https://instagram.com/produtoraviva',
  facebook_url: 'https://facebook.com/produtoraviva',
  youtube_url: '',
  tiktok_url: '',
  linkedin_url: '',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.error('Error loading site settings:', error);
        return;
      }

      const settingsMap: Partial<SiteSettings> = {};
      (data || []).forEach((setting) => {
        settingsMap[setting.setting_key as keyof SiteSettings] = setting.setting_value;
      });

      // Merge with defaults to ensure all properties exist
      setSettings(prevSettings => ({
        ...prevSettings,
        ...settingsMap
      }));
    } catch (error) {
      console.error('Error loading site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch: loadSettings };
}