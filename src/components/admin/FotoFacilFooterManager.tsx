import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, FileText, Mail, Phone, Instagram, MessageCircle, Shield } from 'lucide-react';

interface FooterSettings {
  brand_name: string;
  brand_description: string;
  contact_email: string;
  contact_phone: string;
  show_trust_badges: string;
  instagram_url: string;
  whatsapp_url: string;
}

export function FotoFacilFooterManager() {
  const [settings, setSettings] = useState<FooterSettings>({
    brand_name: 'FOTOFÁCIL',
    brand_description: '',
    contact_email: '',
    contact_phone: '',
    show_trust_badges: 'true',
    instagram_url: '',
    whatsapp_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          show_trust_badges: settingsMap.show_trust_badges || 'true',
          instagram_url: settingsMap.instagram_url || '',
          whatsapp_url: settingsMap.whatsapp_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading footer settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('fotofacil_footer_settings')
          .upsert(update, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      toast.success('Configurações salvas com sucesso');
    } catch (error) {
      console.error('Error saving footer settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Configurações do Rodapé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brand Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Marca</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nome da Marca</Label>
                <Input
                  value={settings.brand_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, brand_name: e.target.value }))}
                  placeholder="FOTOFÁCIL"
                  className="rounded-lg"
                />
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={settings.brand_description}
                onChange={(e) => setSettings(prev => ({ ...prev, brand_description: e.target.value }))}
                placeholder="Sua plataforma de fotos de eventos..."
                rows={3}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-lg">Contato</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail
                </Label>
                <Input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="contato@fotofacil.com"
                  className="rounded-lg"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </Label>
                <Input
                  value={settings.contact_phone}
                  onChange={(e) => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="+55 (11) 99999-9999"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-lg">Redes Sociais</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  URL do Instagram
                </Label>
                <Input
                  value={settings.instagram_url}
                  onChange={(e) => setSettings(prev => ({ ...prev, instagram_url: e.target.value }))}
                  placeholder="https://instagram.com/..."
                  className="rounded-lg"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  URL do WhatsApp
                </Label>
                <Input
                  value={settings.whatsapp_url}
                  onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_url: e.target.value }))}
                  placeholder="https://wa.me/..."
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-lg">Opções</h4>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Selos de Confiança</p>
                  <p className="text-sm text-muted-foreground">Exibir selos de segurança no rodapé</p>
                </div>
              </div>
              <Switch
                checked={settings.show_trust_badges === 'true'}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  show_trust_badges: checked ? 'true' : 'false' 
                }))}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving} className="rounded-lg">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}