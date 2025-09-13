import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Upload } from 'lucide-react';
import { MediaSelector } from './MediaSelector';

interface Category {
  id: string;
  name: string;
  type?: 'photo' | 'video';
  custom_type?: string;
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
  file_size?: number;
  dimensions?: { width: number; height: number };
  created_at: string;
}

interface NewItemCreatorProps {
  onSave: () => void;
  onCancel: () => void;
}

export function NewItemCreator({ onSave, onCancel }: NewItemCreatorProps) {
  const [activeTab, setActiveTab] = useState<'select' | 'upload'>('select');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [refreshMediaTrigger, setRefreshMediaTrigger] = useState(0);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    media_type: 'photo' | 'video';
    category: string;
    subcategory: string;
    publish_status: 'draft' | 'published' | 'hidden';
    is_featured: boolean;
    homepage_featured: boolean;
    location: string;
    date_taken: string;
  }>({
    title: '',
    description: '',
    media_type: 'photo',
    category: '',
    subcategory: '',
    publish_status: 'draft',
    is_featured: false,
    homepage_featured: false,
    location: '',
    date_taken: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedMedia) {
      setFormData(prev => ({
        ...prev,
        title: selectedMedia.title,
        media_type: selectedMedia.media_type,
      }));
    }
  }, [selectedMedia]);

  const loadCategories = async () => {
    try {
      const [categoriesResponse, subcategoriesResponse] = await Promise.all([
        supabase
          .from('portfolio_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order'),
        supabase
          .from('portfolio_subcategories')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
      ]);

      if (categoriesResponse.error) throw categoriesResponse.error;
      if (subcategoriesResponse.error) throw subcategoriesResponse.error;

      setCategories((categoriesResponse.data || []).map(cat => ({
        ...cat,
        type: cat.type as 'photo' | 'video' | undefined
      })));
      setSubcategories(subcategoriesResponse.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedia) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma mídia primeiro.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title.trim() || !formData.category) {
      toast({
        title: 'Erro',
        description: 'Título e categoria são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get next display order
      const { data: maxOrderData } = await supabase
        .from('portfolio_items')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = maxOrderData && maxOrderData.length > 0 
        ? maxOrderData[0].display_order + 1 
        : 0;

      const { error } = await supabase
        .from('portfolio_items')
        .update({
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          subcategory: formData.subcategory || null,
          publish_status: formData.publish_status,
          is_featured: formData.is_featured,
          homepage_featured: formData.homepage_featured,
          location: formData.location || null,
          date_taken: formData.date_taken || null,
          item_status: 'published', // Mark as published item
        })
        .eq('id', selectedMedia.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Item criado com sucesso!',
      });

      onSave();
    } catch (error) {
      console.error('Error creating item:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar item.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Criar Novo Item</h2>
          <p className="text-muted-foreground">
            Selecione uma mídia e configure as informações do item
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Media Selection */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>1. Selecionar Mídia</CardTitle>
              <CardDescription>
                Escolha uma mídia já enviada ou faça upload de uma nova
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="select">Selecionar Existente</TabsTrigger>
                  <TabsTrigger value="upload">Fazer Upload</TabsTrigger>
                </TabsList>
                
                 <TabsContent value="select" className="mt-4">
                   <MediaSelector 
                     onSelect={setSelectedMedia}
                     selectedMediaId={selectedMedia?.id}
                     refreshTrigger={refreshMediaTrigger}
                   />
                 </TabsContent>
                
                 <TabsContent value="upload" className="mt-4">
                   <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                     <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                     <p className="text-muted-foreground">
                       Use a aba "Upload de Mídia" na seção principal para enviar novos arquivos.<br/>
                       Depois retorne aqui para selecioná-los.
                     </p>
                     <Button 
                       variant="outline" 
                       className="mt-4"
                       onClick={() => setRefreshMediaTrigger(prev => prev + 1)}
                     >
                       Atualizar Lista de Mídia
                     </Button>
                   </div>
                 </TabsContent>
              </Tabs>
              
              {selectedMedia && (
                <div className="mt-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {selectedMedia.media_type === 'video' ? (
                        <video
                          src={selectedMedia.file_url}
                          poster={selectedMedia.thumbnail_url}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <img
                          src={selectedMedia.thumbnail_url || selectedMedia.file_url}
                          alt={selectedMedia.title}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{selectedMedia.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedMedia.media_type === 'photo' ? 'Foto' : 'Vídeo'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Item Configuration */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>2. Configurar Item</CardTitle>
              <CardDescription>
                Configure as informações do item do portfólio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Digite o título do item"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição opcional do item"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="media_type">Tipo de Mídia *</Label>
                  <Select
                    value={formData.media_type}
                    onValueChange={(value: 'photo' | 'video') => {
                      setFormData({ 
                        ...formData, 
                        media_type: value,
                        category: '',
                        subcategory: ''
                      });
                    }}
                    disabled={!!selectedMedia}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photo">Foto</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      category: value,
                      subcategory: ''
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(cat => 
                          (!cat.type && !cat.custom_type) || 
                          cat.type === formData.media_type ||
                          cat.custom_type
                        )
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.custom_type || category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategoria (Opcional)</Label>
                  <Select
                    value={formData.subcategory || "none"}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      subcategory: value === "none" ? "" : value 
                    })}
                    disabled={!formData.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma subcategoria (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {subcategories
                        .filter(sub => sub.category_id === formData.category)
                        .map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Local</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Local onde foi capturado"
                  />
                </div>

                <div>
                  <Label htmlFor="date_taken">Data</Label>
                  <Input
                    id="date_taken"
                    type="date"
                    value={formData.date_taken}
                    onChange={(e) => setFormData({ ...formData, date_taken: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="publish_status">Status de Publicação</Label>
                  <Select
                    value={formData.publish_status}
                    onValueChange={(value: any) => setFormData({ ...formData, publish_status: value })}
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

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="is_featured">Item em destaque</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="homepage_featured"
                      checked={formData.homepage_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, homepage_featured: checked })}
                    />
                    <Label htmlFor="homepage_featured">Exibir na homepage</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading || !selectedMedia}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Criando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Criar Item
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}