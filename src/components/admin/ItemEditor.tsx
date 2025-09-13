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
    category: 'casamento' | 'aniversario' | 'corporativo' | 'familia';
    subcategory: string;
    publish_status: 'draft' | 'published' | 'hidden';
    is_featured: boolean;
    location: string;
    date_taken: string;
  }>({
    title: '',
    description: '',
    category: 'casamento',
    subcategory: '',
    publish_status: 'draft',
    is_featured: false,
    location: '',
    date_taken: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || '',
        category: item.category,
        subcategory: item.subcategory || '',
        publish_status: item.publish_status,
        is_featured: item.is_featured,
        location: item.location || '',
        date_taken: item.date_taken || '',
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título é obrigatório.',
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
            category: formData.category,
            subcategory: formData.subcategory || null,
            publish_status: formData.publish_status,
            is_featured: formData.is_featured,
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
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casamento">Casamento</SelectItem>
                      <SelectItem value="aniversario">Aniversário</SelectItem>
                      <SelectItem value="corporativo">Corporativo</SelectItem>
                      <SelectItem value="familia">Família</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategoria</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="Subcategoria opcional"
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Item em destaque</Label>
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