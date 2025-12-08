import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, FileText, Mail, Phone, Instagram, MessageCircle, Shield, Upload, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface FooterSettings {
  logo_url: string;
  brand_name: string;
  brand_description: string;
  contact_email: string;
  contact_phone: string;
  show_trust_badges: string;
  instagram_url: string;
  whatsapp_url: string;
  watermark_url: string;
}

export function FotoFacilFooterManager() {
  const [settings, setSettings] = useState<FooterSettings>({
    logo_url: '',
    brand_name: 'FOTOFÁCIL',
    brand_description: '',
    contact_email: '',
    contact_phone: '',
    show_trust_badges: 'true',
    instagram_url: '',
    whatsapp_url: '',
    watermark_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingWatermark, setUploadingWatermark] = useState(false);
  const [watermarkExists, setWatermarkExists] = useState(false);

  useEffect(() => {
    loadSettings();
    checkWatermarkExists();
  }, []);

  const checkWatermarkExists = async () => {
    try {
      // Try to fetch the watermark to see if it exists
      const response = await fetch('https://storage.googleapis.com/rubensphotofilm/watermarks/selo.png', {
        method: 'HEAD'
      });
      setWatermarkExists(response.ok);
    } catch {
      setWatermarkExists(false);
    }
  };

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
          logo_url: settingsMap.logo_url || '',
          brand_name: settingsMap.brand_name || 'FOTOFÁCIL',
          brand_description: settingsMap.brand_description || '',
          contact_email: settingsMap.contact_email || '',
          contact_phone: settingsMap.contact_phone || '',
          show_trust_badges: settingsMap.show_trust_badges || 'true',
          instagram_url: settingsMap.instagram_url || '',
          whatsapp_url: settingsMap.whatsapp_url || '',
          watermark_url: settingsMap.watermark_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading footer settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const onWatermarkDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    if (!file.type.includes('png')) {
      toast.error('A marca d\'água deve ser um arquivo PNG com transparência');
      return;
    }
    
    setUploadingWatermark(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Use fetch directly for FormData to work correctly
      const response = await fetch(
        'https://ihthnipyfppatlmaajvm.supabase.co/functions/v1/gcs-upload-watermark',
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao fazer upload');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao fazer upload');
      }
      
      // Save watermark URL to settings
      setSettings(prev => ({ ...prev, watermark_url: result.watermarkUrl }));
      setWatermarkExists(true);
      
      toast.success('Marca d\'água enviada com sucesso! As próximas fotos terão a marca aplicada.');
    } catch (error) {
      console.error('Error uploading watermark:', error);
      toast.error('Erro ao enviar marca d\'água');
    } finally {
      setUploadingWatermark(false);
    }
  }, []);

  const { getRootProps: getWatermarkRootProps, getInputProps: getWatermarkInputProps, isDragActive: isWatermarkDragActive } = useDropzone({
    onDrop: onWatermarkDrop,
    accept: { 'image/png': ['.png'] },
    maxFiles: 1,
    disabled: uploadingWatermark
  });

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
      {/* Watermark Upload Section - MOST IMPORTANT */}
      <Card className="border-2 border-amber-500/50 bg-amber-50/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <ImageIcon className="w-5 h-5" />
            Marca D'água (OBRIGATÓRIO)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            {watermarkExists ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Marca d'água configurada</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-2 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Nenhuma marca d'água configurada - fotos serão enviadas SEM proteção!</span>
              </div>
            )}
          </div>
          
          <div
            {...getWatermarkRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isWatermarkDragActive 
                ? 'border-amber-500 bg-amber-50' 
                : 'border-muted-foreground/30 hover:border-amber-500/50 hover:bg-amber-50/50'
            } ${uploadingWatermark ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getWatermarkInputProps()} />
            {uploadingWatermark ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500/30 border-t-amber-500" />
                <p className="text-sm text-muted-foreground">Enviando marca d'água...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-amber-600" />
                <p className="font-medium text-amber-700">
                  {isWatermarkDragActive ? 'Solte aqui...' : 'Clique ou arraste um arquivo PNG'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Use um PNG com fundo transparente para melhores resultados
                </p>
              </div>
            )}
          </div>

          {watermarkExists && (
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground mb-2">Preview da marca d'água atual:</p>
              <div className="bg-gray-200 p-4 rounded-lg inline-block">
                <img 
                  src={`https://storage.googleapis.com/rubensphotofilm/watermarks/selo.png?t=${Date.now()}`}
                  alt="Watermark preview" 
                  className="max-h-24 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Configurações do Rodapé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo & Brand Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Logo & Marca</h4>
            <div>
              <Label>URL da Logo (opcional)</Label>
              <Input
                value={settings.logo_url}
                onChange={(e) => setSettings(prev => ({ ...prev, logo_url: e.target.value }))}
                placeholder="https://exemplo.com/logo.png"
                className="rounded-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se configurada, a logo substituirá o nome nas páginas
              </p>
            </div>
            {settings.logo_url && (
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <img 
                  src={settings.logo_url} 
                  alt="Logo preview" 
                  className="max-h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
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