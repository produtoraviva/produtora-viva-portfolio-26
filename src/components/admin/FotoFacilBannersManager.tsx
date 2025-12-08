import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Image, GripVertical } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
}

export function FotoFacilBannersManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBanner, setNewBanner] = useState({ title: '', image_url: '' });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('fotofacil_banners')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error loading banners:', error);
      toast.error('Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newBanner.title.trim() || !newBanner.image_url.trim()) {
      toast.error('Preencha o título e a URL da imagem');
      return;
    }

    try {
      const maxOrder = banners.length > 0 
        ? Math.max(...banners.map(b => b.display_order)) + 1 
        : 0;

      const { error } = await supabase
        .from('fotofacil_banners')
        .insert({
          title: newBanner.title.trim(),
          image_url: newBanner.image_url.trim(),
          display_order: maxOrder
        });

      if (error) throw error;
      
      toast.success('Banner criado com sucesso');
      setNewBanner({ title: '', image_url: '' });
      loadBanners();
    } catch (error) {
      console.error('Error creating banner:', error);
      toast.error('Erro ao criar banner');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('fotofacil_banners')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      
      setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: isActive } : b));
      toast.success('Banner atualizado');
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Erro ao atualizar banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este banner?')) return;

    try {
      const { error } = await supabase
        .from('fotofacil_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Banner excluído');
      loadBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Erro ao excluir banner');
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
            <Image className="w-5 h-5" />
            Banners da Página Inicial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Banner */}
          <div className="p-4 border border-dashed rounded-lg space-y-4">
            <h4 className="font-medium">Adicionar Novo Banner</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="banner-title">Título</Label>
                <Input
                  id="banner-title"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Encontre suas fotos"
                />
              </div>
              <div>
                <Label htmlFor="banner-url">URL da Imagem</Label>
                <Input
                  id="banner-url"
                  value={newBanner.image_url}
                  onChange={(e) => setNewBanner(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Banner
            </Button>
          </div>

          {/* Banner List */}
          {banners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum banner cadastrado</p>
              <p className="text-sm">Um banner padrão será exibido automaticamente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {banners.map(banner => (
                <div
                  key={banner.id}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-card"
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  
                  <div className="w-20 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{banner.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{banner.image_url}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={(checked) => handleToggleActive(banner.id, checked)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {banner.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(banner.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}