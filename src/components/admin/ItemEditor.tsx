import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Upload } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: 'photo' | 'video';
  is_active: boolean;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  is_active: boolean;
}

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  media_type: 'photo' | 'video';
  file_url: string;
  thumbnail_url?: string;
  category: 'casamento' | 'aniversario' | 'corporativo' | 'familia';
  subcategory?: string;
  publish_status: 'draft' | 'published' | 'hidden';
  is_featured: boolean;
  display_order: number;
  location?: string;
  date_taken?: string;
  file_size?: number;
  dimensions?: { width: number; height: number };
  created_at: string;
  updated_at: string;
}

interface ItemEditorProps {
  item: PortfolioItem | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ItemEditor({ item, onSave, onCancel }: ItemEditorProps) {
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
        type: cat.type as 'photo' | 'video'
      })));
      setSubcategories(subcategoriesResponse.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || '',
        media_type: item.media_type,
        category: item.category,
        subcategory: item.subcategory || '',
        publish_status: item.publish_status,
        is_featured: item.is_featured,
        homepage_featured: (item as any).homepage_featured || false,
        location: item.location || '',
        date_taken: item.date_taken || '',
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.category || !formData.media_type) {
      toast({
        title: 'Erro',
        description: 'Título, tipo de mídia e categoria são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (item) {
        // Update existing item
        const { error } = await supabase
          .from('portfolio_items')
          .update({
            title: formData.title,
            description: formData.description || null,
            media_type: formData.media_type,
            category: formData.category,
            subcategory: formData.subcategory || null,
            publish_status: formData.publish_status,
            is_featured: formData.is_featured,
            homepage_featured: formData.homepage_featured,
            location: formData.location || null,
            date_taken: formData.date_taken || null,
          })
          .eq('id', item.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Item atualizado com sucesso!',
        });
      } else {
        // This would only be reached if creating a new item without file upload
        // In practice, new items should be created through the MediaUploader component
        toast({
          title: 'Erro',
          description: 'Use o upload de mídia para criar novos itens.',
          variant: 'destructive',
        });
        return;
      }

      onSave();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar item.',
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
          <h2 className="text-2xl font-semibold">
            {item ? 'Editar Item' : 'Novo Item'}
          </h2>
          <p className="text-muted-foreground">
            {item ? 'Edite as informações do item do portfólio' : 'Adicione um novo item ao portfólio'}
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="media_type">Tipo de Mídia *</Label>
                  <Select
                    value={formData.media_type}
                    onValueChange={(value: 'photo' | 'video') => {
                      setFormData({ 
                        ...formData, 
                        media_type: value,
                        category: '', // Reset category when media type changes
                        subcategory: ''
                      });
                    }}
                    disabled={!!item} // Disable when editing existing item
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
                      subcategory: '' // Reset subcategory when category changes
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(cat => cat.type === formData.media_type)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategoria</Label>
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
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}