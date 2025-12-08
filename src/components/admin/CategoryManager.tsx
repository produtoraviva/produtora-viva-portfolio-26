import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { Plus, Edit, Trash2, Save, X, Folder, Tag, Settings } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type?: 'photo' | 'video';
  custom_type?: string;
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
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [selectedCategoryForSubcategories, setSelectedCategoryForSubcategories] = useState<Category | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmCloseDialogOpen, setConfirmCloseDialogOpen] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    type: 'photo' as 'photo' | 'video' | 'custom',
    customType: '',
  });
  const [newSubcategoryData, setNewSubcategoryData] = useState({
    name: '',
    category_id: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAdmin();

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
        type: cat.type as 'photo' | 'video' | undefined,
        custom_type: cat.custom_type
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
      const insertData: any = {
        name: newCategoryData.name,
        display_order: categories.length + 1,
      };

      if (newCategoryData.type === 'custom') {
        if (!newCategoryData.customType.trim()) {
          toast({
            title: 'Erro',
            description: 'Tipo personalizado é obrigatório.',
            variant: 'destructive',
          });
          return;
        }
        insertData.custom_type = newCategoryData.customType;
      } else {
        insertData.type = newCategoryData.type;
      }

      const { error } = await supabase
        .from('portfolio_categories')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Categoria criada com sucesso!',
      });
      
      setNewCategoryData({ name: '', type: 'photo', customType: '' });
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
    const categoryId = selectedCategoryForSubcategories?.id || newSubcategoryData.category_id;
    
    if (!newSubcategoryData.name.trim() || !categoryId) {
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
          category_id: categoryId,
          display_order: subcategories.filter(s => s.category_id === categoryId).length + 1,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Subcategoria criada com sucesso!',
      });
      
      setNewSubcategoryData({ name: '', category_id: '' });
      setIsCreatingSubcategory(false);
      setHasUnsavedChanges(false);
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
      setHasUnsavedChanges(false);
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

  const openSubcategoryModal = (category: Category) => {
    setSelectedCategoryForSubcategories(category);
    setSubcategoryModalOpen(true);
    setHasUnsavedChanges(false);
  };

  const handleCloseSubcategoryModal = () => {
    if (hasUnsavedChanges || isCreatingSubcategory || editingSubcategory) {
      setConfirmCloseDialogOpen(true);
    } else {
      closeSubcategoryModal();
    }
  };

  const closeSubcategoryModal = () => {
    setSubcategoryModalOpen(false);
    setSelectedCategoryForSubcategories(null);
    setIsCreatingSubcategory(false);
    setEditingSubcategory(null);
    setNewSubcategoryData({ name: '', category_id: '' });
    setHasUnsavedChanges(false);
  };

  const getCategorySubcategories = (categoryId: string) => {
    return subcategories.filter(s => s.category_id === categoryId);
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

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Acesso negado</h3>
          <p className="text-muted-foreground">Você precisa estar logado como admin para gerenciar categorias.</p>
        </div>
      </div>
    );
  }

  const photoCategories = categories.filter(cat => cat.type === 'photo' || !cat.type);
  const videoCategories = categories.filter(cat => cat.type === 'video');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Gerenciar Categorias</h2>
          <p className="text-muted-foreground">
            Crie e gerencie categorias e subcategorias do portfólio
          </p>
        </div>
        <Button
          onClick={() => setIsCreatingCategory(true)}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Categories Section - Split by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photo Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              <CardTitle>Categorias de Foto</CardTitle>
            </div>
            <CardDescription>
              Gerencie as categorias de fotografia
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
                      onValueChange={(value: 'photo' | 'video' | 'custom') => setNewCategoryData({ ...newCategoryData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">Foto</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                        <SelectItem value="custom">Tipo Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newCategoryData.type === 'custom' && (
                    <div>
                      <Label htmlFor="custom-type">Tipo Personalizado</Label>
                      <Input
                        id="custom-type"
                        value={newCategoryData.customType}
                        onChange={(e) => setNewCategoryData({ ...newCategoryData, customType: e.target.value })}
                        placeholder="Ex: 3D, Drone, etc."
                      />
                    </div>
                  )}
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

            <div className="grid grid-cols-1 gap-4">
              {photoCategories.map((category) => (
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
                        <div className="flex-1">
                          <h4 className="font-medium">{category.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="default">Foto</Badge>
                            <Badge variant={category.is_active ? 'outline' : 'destructive'}>
                              {category.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          {/* Show subcategories in small text */}
                          {getCategorySubcategories(category.id).length > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Subcategorias: {getCategorySubcategories(category.id).map(s => s.name).join(', ')}
                            </p>
                          )}
                        </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSubcategoryModal(category)}
                          title="Gerenciar subcategorias"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
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

        {/* Video Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              <CardTitle>Categorias de Vídeo</CardTitle>
            </div>
            <CardDescription>
              Gerencie as categorias de videografia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {videoCategories.map((category) => (
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
                        <div className="flex-1">
                          <h4 className="font-medium">{category.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">Vídeo</Badge>
                            <Badge variant={category.is_active ? 'outline' : 'destructive'}>
                              {category.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          {/* Show subcategories in small text */}
                          {getCategorySubcategories(category.id).length > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Subcategorias: {getCategorySubcategories(category.id).map(s => s.name).join(', ')}
                            </p>
                          )}
                        </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSubcategoryModal(category)}
                          title="Gerenciar subcategorias"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
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
      </div>

      {/* Subcategory Modal */}
      <Dialog open={subcategoryModalOpen} onOpenChange={(open) => !open && handleCloseSubcategoryModal()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Subcategorias de {selectedCategoryForSubcategories?.name}
            </DialogTitle>
            <DialogDescription>
              Gerencie as subcategorias desta categoria
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Add new subcategory */}
            {isCreatingSubcategory ? (
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="space-y-3">
                  <Input
                    value={newSubcategoryData.name}
                    onChange={(e) => {
                      setNewSubcategoryData({ ...newSubcategoryData, name: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Nome da subcategoria"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateSubcategory} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreatingSubcategory(false);
                        setNewSubcategoryData({ name: '', category_id: '' });
                      }}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button onClick={() => setIsCreatingSubcategory(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Subcategoria
              </Button>
            )}

            {/* List subcategories */}
            <div className="space-y-2">
              {selectedCategoryForSubcategories && getCategorySubcategories(selectedCategoryForSubcategories.id).map((subcategory) => (
                <div key={subcategory.id} className="border rounded-lg p-3 bg-muted/30">
                  {editingSubcategory?.id === subcategory.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editingSubcategory.name}
                        onChange={(e) => {
                          setEditingSubcategory({ ...editingSubcategory, name: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdateSubcategory(editingSubcategory)} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                        <Button variant="outline" onClick={() => setEditingSubcategory(null)} size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{subcategory.name}</span>
                        <Badge variant={subcategory.is_active ? 'outline' : 'destructive'}>
                          {subcategory.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingSubcategory(subcategory)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteSubcategory(subcategory.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {selectedCategoryForSubcategories && getCategorySubcategories(selectedCategoryForSubcategories.id).length === 0 && !isCreatingSubcategory && (
                <p className="text-muted-foreground text-center py-4">Nenhuma subcategoria cadastrada</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm close dialog */}
      <AlertDialog open={confirmCloseDialogOpen} onOpenChange={setConfirmCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Deseja sair sem salvar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={closeSubcategoryModal}>
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}