import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ImageIcon, Upload, Trash2, Save, Info } from 'lucide-react';

export function FotoFacilWatermarkManager() {
  const [watermarkUrl, setWatermarkUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('fotofacil_footer_settings')
        .select('*')
        .eq('setting_key', 'watermark_url')
        .maybeSingle();
      
      if (data) {
        setWatermarkUrl(data.setting_value || '');
      }
    } catch (error) {
      console.error('Error loading watermark settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('fotofacil_footer_settings')
        .upsert({
          setting_key: 'watermark_url',
          setting_value: watermarkUrl.trim()
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
      toast.success('Marca d\'água salva com sucesso!');
    } catch (error) {
      console.error('Error saving watermark:', error);
      toast.error('Erro ao salvar marca d\'água');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setWatermarkUrl('');
    setSaving(true);
    try {
      const { error } = await supabase
        .from('fotofacil_footer_settings')
        .upsert({
          setting_key: 'watermark_url',
          setting_value: ''
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
      toast.success('Marca d\'água removida');
    } catch (error) {
      console.error('Error removing watermark:', error);
      toast.error('Erro ao remover marca d\'água');
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
            <ImageIcon className="w-5 h-5" />
            Marca d'Água
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Proteção de Imagens</p>
              <p className="text-blue-700">
                A marca d'água será aplicada em todas as fotos exibidas no site antes da compra. 
                Use uma imagem PNG com fundo transparente para melhores resultados.
                A marca será repetida em toda a foto para máxima proteção.
              </p>
            </div>
          </div>

          {/* Watermark URL Input */}
          <div className="space-y-2">
            <Label htmlFor="watermark-url">URL da Marca d'Água (PNG recomendado)</Label>
            <Input
              id="watermark-url"
              value={watermarkUrl}
              onChange={(e) => setWatermarkUrl(e.target.value)}
              placeholder="https://exemplo.com/marca-dagua.png"
              className="rounded-lg"
            />
            <p className="text-xs text-muted-foreground">
              Use uma imagem PNG com fundo transparente. A imagem será redimensionada automaticamente.
            </p>
          </div>

          {/* Preview */}
          {watermarkUrl && (
            <div className="space-y-2">
              <Label>Prévia</Label>
              <div className="relative w-full max-w-md aspect-video bg-gray-100 rounded-xl overflow-hidden border">
                {/* Sample background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">Exemplo de foto</span>
                </div>
                {/* Watermark overlay */}
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${watermarkUrl})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '30% auto',
                    backgroundPosition: 'center center',
                    opacity: 0.4,
                    mixBlendMode: 'multiply'
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="rounded-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
            
            {watermarkUrl && (
              <Button 
                variant="outline"
                onClick={handleRemove}
                disabled={saving}
                className="rounded-lg text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remover
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}