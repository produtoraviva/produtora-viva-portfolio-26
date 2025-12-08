import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Save, X, GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

export function FotoFacilCategoriesManager() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('fotofacil_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast({ title: 'Erro ao carregar categorias', variant: 'destructive' });
    } else {
      setCategories(data || []);
    }
    setIsLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', image_url: '', is_active: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      is_active: category.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast({ title: 'Nome e slug são obrigatórios', variant: 'destructive' });
      return;
    }

    if (editingCategory) {
      const { error } = await supabase
        .from('fotofacil_categories')
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          image_url: formData.image_url || null,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingCategory.id);

      if (error) {
        toast({ title: 'Erro ao atualizar categoria', variant: 'destructive' });
      } else {
        toast({ title: 'Categoria atualizada!' });
        setIsDialogOpen(false);
        loadCategories();
      }
    } else {
      const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.display_order ?? 0)) : 0;
      
      const { error } = await supabase
        .from('fotofacil_categories')
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          image_url: formData.image_url || null,
          is_active: formData.is_active,
          display_order: maxOrder + 1,
        });

      if (error) {
        toast({ title: 'Erro ao criar categoria', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Categoria criada!' });
        setIsDialogOpen(false);
        loadCategories();
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    // First check if there are any events in this category
    const { data: events } = await supabase
      .from('fotofacil_events')
      .select('id')
      .eq('category_id', deleteId);

    if (events && events.length > 0) {
      // Unlink events from this category first
      const { error: unlinkError } = await supabase
        .from('fotofacil_events')
        .update({ category_id: null })
        .eq('category_id', deleteId);

      if (unlinkError) {
        toast({ title: 'Erro ao desvincular eventos', description: unlinkError.message, variant: 'destructive' });
        setDeleteId(null);
        return;
      }
    }

    const { error } = await supabase
      .from('fotofacil_categories')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({ title: 'Erro ao excluir categoria', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Categoria excluída!' });
      loadCategories();
    }
    setDeleteId(null);
  };

  const toggleActive = async (category: Category) => {
    const { error } = await supabase
      .from('fotofacil_categories')
      .update({ is_active: !category.is_active, updated_at: new Date().toISOString() })
      .eq('id', category.id);

    if (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    } else {
      loadCategories();
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8 text-gray-700">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorias FOTOFÁCIL</h2>
          <p className="text-gray-600 text-sm">Gerencie as categorias de eventos</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className={`bg-white border-gray-200 ${!category.is_active ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                  <CardTitle className="text-lg text-gray-900">{category.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)} className="text-gray-600 hover:text-gray-900">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(category.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-gray-500 font-mono">/{category.slug}</p>
              {category.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
              )}
              {category.image_url && (
                <img 
                  src={category.image_url} 
                  alt={category.name} 
                  className="w-full h-24 object-cover rounded"
                />
              )}
              <div className="flex items-center justify-between pt-2">
                <Label htmlFor={`active-${category.id}`} className="text-sm text-gray-700">Ativa</Label>
                <Switch
                  id={`active-${category.id}`}
                  checked={category.is_active ?? true}
                  onCheckedChange={() => toggleActive(category)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-600 bg-white rounded-xl border border-gray-200">
          Nenhuma categoria criada. Clique em "Nova Categoria" para começar.
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Casamentos"
              />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="casamentos"
              />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da categoria..."
              />
            </div>
            <div>
              <Label>URL da Imagem (opcional)</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Categoria ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os eventos desta categoria serão desvinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
