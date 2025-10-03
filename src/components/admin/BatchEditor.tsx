import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, Camera, Video, AlertTriangle, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Category {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  is_active: boolean;
}

interface MediaItem {
  id: string;
  title: string;
  media_type: 'photo' | 'video';
  file_url: string;
  thumbnail_url?: string;
}

interface BatchEditorProps {
  onSave: () => void;
  onCancel: () => void;
}

export function BatchEditor({ onSave, onCancel }: BatchEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date_taken: '',
    media_type: '' as 'photo' | 'video' | '',
    category: '',
    subcategory: '',
    publish_status: 'draft' as 'draft' | 'published' | 'hidden',
    is_featured: false,
    homepage_featured: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingMedia(true);
      
      // Carregar categorias
      const { data: categoriesData } = await supabase
        .from('portfolio_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      // Carregar subcategorias
      const { data: subcategoriesData } = await supabase
        .from('portfolio_subcategories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      // Carregar mídias publicadas
      const { data: mediaData } = await supabase
        .from('portfolio_items')
        .select('id, title, media_type, file_url, thumbnail_url')
        .eq('publish_status', 'published')
        .order('created_at', { ascending: false });

      setCategories(categoriesData || []);
      setSubcategories(subcategoriesData || []);
      setMediaItems((mediaData || []).map(item => ({
        ...item,
        media_type: item.media_type as 'photo' | 'video'
      })));
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados.',
        variant: 'destructive',
      });
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleSelectMedia = (item: MediaItem) => {
    // Se já está selecionado, remove
    if (selectedItems.some(selected => selected.id === item.id)) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
      
      // Se não tem mais itens selecionados, limpa o media_type
      if (selectedItems.length === 1) {
        setFormData(prev => ({ ...prev, media_type: '' }));
      }
      return;
    }

    // Se não tem itens selecionados, define o tipo de mídia
    if (selectedItems.length === 0) {
      setFormData(prev => ({ ...prev, media_type: item.media_type }));
      setSelectedItems([item]);
      return;
    }

    // Verifica se o tipo de mídia é o mesmo
    if (formData.media_type !== item.media_type) {
      toast({
        title: 'Tipo de mídia diferente',
        description: 'Não é possível selecionar fotos e vídeos ao mesmo tempo.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedItems([...selectedItems, item]);
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'Nenhuma mídia selecionada',
        description: 'Selecione pelo menos uma mídia para continuar.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title || !formData.category) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha pelo menos o título e a categoria.',
        variant: 'destructive',
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    try {
      setIsLoading(true);
      setShowConfirmDialog(false);

      // Atualizar todas as mídias selecionadas
      const updatePromises = selectedItems.map(item =>
        supabase
          .from('portfolio_items')
          .update({
            title: formData.title,
            description: formData.description || null,
            location: formData.location || null,
            date_taken: formData.date_taken || null,
            category: formData.category,
            subcategory: formData.subcategory || null,
            publish_status: formData.publish_status,
            is_featured: formData.is_featured,
            homepage_featured: formData.homepage_featured,
          })
          .eq('id', item.id)
      );

      await Promise.all(updatePromises);

      toast({
        title: 'Sucesso',
        description: `${selectedItems.length} ${selectedItems.length === 1 ? 'item atualizado' : 'itens atualizados'} com sucesso!`,
      });

      onSave();
    } catch (error) {
      console.error('Error updating items:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar itens.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubcategories = subcategories.filter(
    sub => sub.category_id === formData.category
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Ensaio</CardTitle>
          <CardDescription>
            Selecione múltiplas mídias e edite todas de uma vez com as mesmas informações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Mídias */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Selecionar Mídias {selectedItems.length > 0 && `(${selectedItems.length} selecionadas)`}
              </Label>
              {selectedItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedItems([]);
                    setFormData(prev => ({ ...prev, media_type: '' }));
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar Seleção
                </Button>
              )}
            </div>

            {formData.media_type && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {formData.media_type === 'photo' ? (
                  <Camera className="h-4 w-4" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                <span>
                  Selecionando apenas {formData.media_type === 'photo' ? 'fotos' : 'vídeos'}
                </span>
              </div>
            )}

            {/* Preview das mídias selecionadas */}
            {selectedItems.length > 0 && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Mídias Selecionadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] w-full">
                    <div className="grid grid-cols-4 gap-2 pr-4">
                      {selectedItems.map((item) => (
                        <div
                          key={item.id}
                          className="relative group cursor-pointer"
                          onClick={() => handleSelectMedia(item)}
                        >
                          <img
                            src={item.thumbnail_url || item.file_url}
                            alt={item.title}
                            className="w-full h-20 object-cover rounded-md border-2 border-primary"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                            <X className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Grid de mídias disponíveis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Mídias Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingMedia ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] w-full">
                    <div className="grid grid-cols-4 gap-2 pr-4">
                      {mediaItems
                        .filter(item => 
                          !formData.media_type || item.media_type === formData.media_type
                        )
                        .map((item) => {
                          const isSelected = selectedItems.some(selected => selected.id === item.id);
                          return (
                            <div
                              key={item.id}
                              className={`relative cursor-pointer group ${
                                isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                              }`}
                              onClick={() => handleSelectMedia(item)}
                            >
                              <img
                                src={item.thumbnail_url || item.file_url}
                                alt={item.title}
                                className="w-full h-20 object-cover rounded-md hover:opacity-80 transition-opacity"
                              />
                              {item.media_type === 'video' && (
                                <div className="absolute top-1 right-1 bg-black/70 rounded px-1">
                                  <Video className="h-3 w-3 text-white" />
                                </div>
                              )}
                              {isSelected && (
                                <div className="absolute inset-0 bg-primary/20 rounded-md flex items-center justify-center">
                                  <CheckCircle className="h-6 w-6 text-primary" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Edição */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Informações do Ensaio</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Casamento Ana e João"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Igreja São Pedro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date_taken}
                  onChange={(e) => setFormData({ ...formData, date_taken: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.category && filteredSubcategories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategoria</Label>
                  <Select 
                    value={formData.subcategory} 
                    onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="status">Status de Publicação</Label>
                <Select 
                  value={formData.publish_status} 
                  onValueChange={(value: 'draft' | 'published' | 'hidden') => 
                    setFormData({ ...formData, publish_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="hidden">Oculto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do ensaio..."
                rows={4}
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="featured">Item em Destaque</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="homepage"
                  checked={formData.homepage_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, homepage_featured: checked })}
                />
                <Label htmlFor="homepage">Destacar na Homepage</Label>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || selectedItems.length === 0}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar {selectedItems.length > 0 && `(${selectedItems.length} itens)`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirmar Edição em Lote
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Você está prestes a atualizar <strong>{selectedItems.length}</strong>{' '}
                {selectedItems.length === 1 ? 'item' : 'itens'} com as mesmas informações:
              </p>
              <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                <p><strong>Título:</strong> {formData.title}</p>
                {formData.description && <p><strong>Descrição:</strong> {formData.description}</p>}
                {formData.location && <p><strong>Local:</strong> {formData.location}</p>}
                {formData.date_taken && <p><strong>Data:</strong> {formData.date_taken}</p>}
              </div>
              <ScrollArea className="h-[150px] w-full border rounded-md p-2">
                <div className="grid grid-cols-6 gap-2">
                  {selectedItems.map((item) => (
                    <img
                      key={item.id}
                      src={item.thumbnail_url || item.file_url}
                      alt={item.title}
                      className="w-full h-16 object-cover rounded"
                    />
                  ))}
                </div>
              </ScrollArea>
              <p className="text-destructive text-xs">
                Esta ação não pode ser desfeita. Deseja continuar?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>
              Confirmar Edição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
