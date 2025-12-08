import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Shield, CreditCard, Mail, Phone, Download, Instagram, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FooterSettings {
  brand_name: string;
  brand_description: string;
  contact_email: string;
  contact_phone: string;
  show_trust_badges: boolean;
  instagram_url: string;
  whatsapp_url: string;
}

const FotoFacilFooter = () => {
  const [settings, setSettings] = useState<FooterSettings>({
    brand_name: 'FOTOFÁCIL',
    brand_description: 'Sua plataforma de fotos de eventos. Encontre e compre suas fotos de forma rápida e segura.',
    contact_email: 'contato@fotofacil.com',
    contact_phone: '+55 (11) 99999-9999',
    show_trust_badges: true,
    instagram_url: '',
    whatsapp_url: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('fotofacil_footer_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach(item => {
          settingsMap[item.setting_key] = item.setting_value;
        });
        
        setSettings({
          brand_name: settingsMap.brand_name || 'FOTOFÁCIL',
          brand_description: settingsMap.brand_description || '',
          contact_email: settingsMap.contact_email || '',
          contact_phone: settingsMap.contact_phone || '',
          show_trust_badges: settingsMap.show_trust_badges === 'true',
          instagram_url: settingsMap.instagram_url || '',
          whatsapp_url: settingsMap.whatsapp_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading footer settings:', error);
    }
  };

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Trust Badges */}
      {settings.show_trust_badges && (
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                </div>
                <span className="text-xs md:text-sm text-gray-300">Compra Segura</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                </div>
                <span className="text-xs md:text-sm text-gray-300">Pagamento PIX</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                </div>
                <span className="text-xs md:text-sm text-gray-300">Alta Resolução</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <Download className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                </div>
                <span className="text-xs md:text-sm text-gray-300">Download Imediato</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-black tracking-tight mb-4">{settings.brand_name}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {settings.brand_description}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-300">Links Úteis</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/fotofacil" className="text-gray-400 hover:text-white transition-colors">
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link to="/fotofacil/minhas-fotos" className="text-gray-400 hover:text-white transition-colors">
                  Baixar Minhas Fotos
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Voltar ao Site Principal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-300">Contato</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {settings.contact_email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{settings.contact_email}</span>
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{settings.contact_phone}</span>
                </li>
              )}
            </ul>
            
            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              {settings.instagram_url && (
                <a 
                  href={settings.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-gray-400" />
                </a>
              )}
              {settings.whatsapp_url && (
                <a 
                  href={settings.whatsapp_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {settings.brand_name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FotoFacilFooter;