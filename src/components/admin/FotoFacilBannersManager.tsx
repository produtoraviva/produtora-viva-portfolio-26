import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Image, GripVertical, Pencil, Clock, Eye } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
  slide_duration: number | null;
  opacity: number | null;
}

export function FotoFacilBannersManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBanner, setNewBanner] = useState({ title: '', image_url: '', slide_duration: 5, opacity: 1 });
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
          display_order: maxOrder,
          slide_duration: newBanner.slide_duration,
          opacity: newBanner.opacity
        });

      if (error) throw error;
      
      toast.success('Banner criado com sucesso');
      setNewBanner({ title: '', image_url: '', slide_duration: 5, opacity: 1 });
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

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBanner) return;

    try {
      const { error } = await supabase
        .from('fotofacil_banners')
        .update({
          title: editingBanner.title,
          image_url: editingBanner.image_url,
          slide_duration: editingBanner.slide_duration,
          opacity: editingBanner.opacity
        })
        .eq('id', editingBanner.id);

      if (error) throw error;
      
      toast.success('Banner atualizado');
      setEditDialogOpen(false);
      setEditingBanner(null);
      loadBanners();
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
          <div className="p-4 border border-dashed rounded-xl space-y-4">
            <h4 className="font-medium">Adicionar Novo Banner</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="banner-title">Título</Label>
                <Input
                  id="banner-title"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Encontre suas fotos"
                  className="rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="banner-url">URL da Imagem</Label>
                <Input
                  id="banner-url"
                  value={newBanner.image_url}
                  onChange={(e) => setNewBanner(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://..."
                  className="rounded-lg"
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duração do Slide (segundos): {newBanner.slide_duration}s
                </Label>
                <Slider
                  value={[newBanner.slide_duration]}
                  onValueChange={([value]) => setNewBanner(prev => ({ ...prev, slide_duration: value }))}
                  min={2}
                  max={15}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Opacidade: {Math.round(newBanner.opacity * 100)}%
                </Label>
                <Slider
                  value={[newBanner.opacity]}
                  onValueChange={([value]) => setNewBanner(prev => ({ ...prev, opacity: value }))}
                  min={0.3}
                  max={1}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>
            
            <Button onClick={handleCreate} className="rounded-lg">
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
                  className="flex items-center gap-4 p-4 border rounded-xl bg-card"
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  
                  <div className="w-24 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                      style={{ opacity: banner.opacity ?? 1 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{banner.title}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{banner.slide_duration || 5}s</span>
                      <span>{Math.round((banner.opacity ?? 1) * 100)}% opacidade</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={(checked) => handleToggleActive(banner.id, checked)}
                      />
                      <span className="text-sm text-muted-foreground hidden sm:inline">
                        {banner.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(banner)}
                      className="rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(banner.id)}
                      className="text-destructive hover:text-destructive rounded-lg"
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Banner</DialogTitle>
          </DialogHeader>
          
          {editingBanner && (
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="rounded-lg"
                />
              </div>
              
              <div>
                <Label>URL da Imagem</Label>
                <Input
                  value={editingBanner.image_url}
                  onChange={(e) => setEditingBanner(prev => prev ? { ...prev, image_url: e.target.value } : null)}
                  className="rounded-lg"
                />
              </div>
              
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  Duração do Slide: {editingBanner.slide_duration || 5}s
                </Label>
                <Slider
                  value={[editingBanner.slide_duration || 5]}
                  onValueChange={([value]) => setEditingBanner(prev => prev ? { ...prev, slide_duration: value } : null)}
                  min={2}
                  max={15}
                  step={1}
                />
              </div>
              
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4" />
                  Opacidade: {Math.round((editingBanner.opacity ?? 1) * 100)}%
                </Label>
                <Slider
                  value={[editingBanner.opacity ?? 1]}
                  onValueChange={([value]) => setEditingBanner(prev => prev ? { ...prev, opacity: value } : null)}
                  min={0.3}
                  max={1}
                  step={0.1}
                />
              </div>
              
              {/* Preview */}
              {editingBanner.image_url && (
                <div className="rounded-lg overflow-hidden border">
                  <img 
                    src={editingBanner.image_url} 
                    alt="Preview" 
                    className="w-full h-32 object-cover"
                    style={{ opacity: editingBanner.opacity ?? 1 }}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-lg">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="rounded-lg">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}