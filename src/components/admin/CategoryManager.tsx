import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X, Folder, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: 'photo' | 'video';
  is_active: boolean;
  display_order: number;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  is_active: boolean;
  display_order: number;
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    type: 'photo' as 'photo' | 'video',
  });
  const [newSubcategoryData, setNewSubcategoryData] = useState({
    name: '',
    category_id: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [categoriesResponse, subcategoriesResponse] = await Promise.all([
        supabase
          .from('portfolio_categories')
          .select('*')
          .order('display_order'),
        supabase
          .from('portfolio_subcategories')
          .select('*')
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
      console.error('Error loading data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar categorias e subcategorias.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da categoria é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('portfolio_categories')
        .insert({
          name: newCategoryData.name,
          type: newCategoryData.type,
          display_order: categories.length + 1,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Categoria criada com sucesso!',
      });
      
      setNewCategoryData({ name: '', type: 'photo' });
      setIsCreatingCategory(false);
      loadData();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar categoria.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateSubcategory = async () => {
    if (!newSubcategoryData.name.trim() || !newSubcategoryData.category_id) {
      toast({
        title: 'Erro',
        description: 'Nome e categoria são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('portfolio_subcategories')
        .insert({
          name: newSubcategoryData.name,
          category_id: newSubcategoryData.category_id,
          display_order: subcategories.filter(s => s.category_id === newSubcategoryData.category_id).length + 1,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Subcategoria criada com sucesso!',
      });
      
      setNewSubcategoryData({ name: '', category_id: '' });
      setIsCreatingSubcategory(false);
      loadData();
    } catch (error) {
      console.error('Error creating subcategory:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar subcategoria.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('portfolio_categories')
        .update({
          name: category.name,
          type: category.type,
          is_active: category.is_active,
        })
        .eq('id', category.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Categoria atualizada com sucesso!',
      });
      
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar categoria.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSubcategory = async (subcategory: Subcategory) => {
    try {
      const { error } = await supabase
        .from('portfolio_subcategories')
        .update({
          name: subcategory.name,
          is_active: subcategory.is_active,
        })
        .eq('id', subcategory.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Subcategoria atualizada com sucesso!',
      });
      
      setEditingSubcategory(null);
      loadData();
    } catch (error) {
      console.error('Error updating subcategory:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar subcategoria.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Categoria excluída com sucesso!',
      });
      
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir categoria. Verifique se não há itens vinculados.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_subcategories')
        .delete()
        .eq('id', subcategoryId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Subcategoria excluída com sucesso!',
      });
      
      loadData();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir subcategoria. Verifique se não há itens vinculados.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Gerenciar Categorias</h2>
          <p className="text-muted-foreground">
            Crie e gerencie categorias e subcategorias do portfólio
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              <CardTitle>Categorias</CardTitle>
            </div>
            <Button
              onClick={() => setIsCreatingCategory(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
          <CardDescription>
            Gerencie as categorias principais (Foto/Vídeo)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCreatingCategory && (
            <div className="border rounded-lg p-4 mb-4 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category-name">Nome</Label>
                  <Input
                    id="category-name"
                    value={newCategoryData.name}
                    onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                    placeholder="Nome da categoria"
                  />
                </div>
                <div>
                  <Label htmlFor="category-type">Tipo</Label>
                  <Select
                    value={newCategoryData.type}
                    onValueChange={(value: 'photo' | 'video') => setNewCategoryData({ ...newCategoryData, type: value })}
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
                <div className="flex items-end gap-2">
                  <Button onClick={handleCreateCategory} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingCategory(false)}
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border rounded-lg p-4 space-y-2"
              >
                {editingCategory?.id === category.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    />
                    <Select
                      value={editingCategory.type}
                      onValueChange={(value: 'photo' | 'video') => setEditingCategory({ ...editingCategory, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">Foto</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdateCategory(editingCategory)}
                        size="sm"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingCategory(null)}
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={category.type === 'photo' ? 'default' : 'secondary'}>
                          {category.type === 'photo' ? 'Foto' : 'Vídeo'}
                        </Badge>
                        <Badge variant={category.is_active ? 'outline' : 'destructive'}>
                          {category.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a categoria "{category.name}"? 
                              Esta ação não pode ser desfeita e também excluirá todas as subcategorias vinculadas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subcategories Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              <CardTitle>Subcategorias</CardTitle>
            </div>
            <Button
              onClick={() => setIsCreatingSubcategory(true)}
              size="sm"
              disabled={categories.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Subcategoria
            </Button>
          </div>
          <CardDescription>
            Gerencie as subcategorias vinculadas às categorias principais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCreatingSubcategory && (
            <div className="border rounded-lg p-4 mb-4 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="subcategory-name">Nome</Label>
                  <Input
                    id="subcategory-name"
                    value={newSubcategoryData.name}
                    onChange={(e) => setNewSubcategoryData({ ...newSubcategoryData, name: e.target.value })}
                    placeholder="Nome da subcategoria"
                  />
                </div>
                <div>
                  <Label htmlFor="subcategory-category">Categoria</Label>
                  <Select
                    value={newSubcategoryData.category_id}
                    onValueChange={(value) => setNewSubcategoryData({ ...newSubcategoryData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.type === 'photo' ? 'Foto' : 'Vídeo'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={handleCreateSubcategory} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingSubcategory(false)}
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {categories.map((category) => {
              const categorySubcategories = subcategories.filter(s => s.category_id === category.id);
              
              if (categorySubcategories.length === 0) return null;
              
              return (
                <div key={category.id} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    {category.name}
                    <Badge variant={category.type === 'photo' ? 'default' : 'secondary'}>
                      {category.type === 'photo' ? 'Foto' : 'Vídeo'}
                    </Badge>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categorySubcategories.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className="border rounded-lg p-3 bg-muted/30"
                      >
                        {editingSubcategory?.id === subcategory.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editingSubcategory.name}
                              onChange={(e) => setEditingSubcategory({ ...editingSubcategory, name: e.target.value })}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleUpdateSubcategory(editingSubcategory)}
                                size="sm"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Salvar
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setEditingSubcategory(null)}
                                size="sm"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{subcategory.name}</span>
                              <Badge 
                                variant={subcategory.is_active ? 'outline' : 'destructive'}
                                className="ml-2"
                              >
                                {subcategory.is_active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingSubcategory(subcategory)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir a subcategoria "{subcategory.name}"? 
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSubcategory(subcategory.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}