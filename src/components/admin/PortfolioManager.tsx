import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { ItemEditor } from './ItemEditor';
import { NewItemCreator } from './NewItemCreator';
import { BatchEditor } from './BatchEditor';
import { CategoryMultiSelect } from './CategoryMultiSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, Move, RefreshCw, Home, HomeIcon, Filter, X, Camera, Video, LayoutGrid, List, Briefcase } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  media_type: 'photo' | 'video';
  file_url: string;
  thumbnail_url?: string;
  category: string; // Now UUID reference to portfolio_categories
  subcategory?: string; // Now UUID reference to portfolio_subcategories
  publish_status: 'draft' | 'published' | 'hidden';
  is_featured: boolean;
  homepage_featured: boolean;
  display_order: number;
  location?: string;
  date_taken?: string;
  file_size?: number;
  dimensions?: { width: number; height: number };
  created_at: string;
  updated_at: string;
}

interface PortfolioManagerProps {
  items: PortfolioItem[];
  viewMode: 'grid' | 'list';
  onItemsChange: () => void;
}

export function PortfolioManager({ items, viewMode, onItemsChange }: PortfolioManagerProps) {
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isBatchEditing, setIsBatchEditing] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>(items);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [localViewMode, setLocalViewMode] = useState<'grid' | 'list'>(viewMode);
  const [viewType, setViewType] = useState<'unified' | 'by-category'>('unified');
  
  // Filtros - agora com multi-select para categorias
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');
  const [homepageFilter, setHomepageFilter] = useState<string>('all');
  const [otherWorksFilter, setOtherWorksFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Carregar categorias e subcategorias
  useEffect(() => {
    console.log('Loading categories and subcategories...');
    const loadCategoriesAndSubcategories = async () => {
      try {
        const { data: categoriesData } = await supabase
          .from('portfolio_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
        
        const { data: subcategoriesData } = await supabase
          .from('portfolio_subcategories')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
        
        setCategories(categoriesData || []);
        setSubcategories(subcategoriesData || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadCategoriesAndSubcategories();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...items];
    
    // Filtro por tipo de mídia
    if (mediaTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.media_type === mediaTypeFilter);
    }
    
    // Filtro por categoria (multi-select)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => selectedCategories.includes(item.category));
    }
    
    // Filtro por subcategoria
    if (subcategoryFilter !== 'all') {
      filtered = filtered.filter(item => item.subcategory === subcategoryFilter);
    }
    
    // Filtro por homepage
    if (homepageFilter !== 'all') {
      const isHomepage = homepageFilter === 'yes';
      filtered = filtered.filter(item => item.homepage_featured === isHomepage);
    }
    
    // Filtro por outros trabalhos
    if (otherWorksFilter !== 'all') {
      const isOtherWorks = otherWorksFilter === 'yes';
      filtered = filtered.filter(item => (item as any).other_works_featured === isOtherWorks);
    }
    
    // Filtro por pesquisa
    if (searchFilter && searchFilter.trim() !== '') {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchFilter.toLowerCase()))
      );
    }
    
    setFilteredItems(filtered);
  }, [items, mediaTypeFilter, selectedCategories, subcategoryFilter, homepageFilter, otherWorksFilter, searchFilter]);

  const clearFilters = () => {
    setMediaTypeFilter('all');
    setSelectedCategories([]);
    setSubcategoryFilter('all');
    setHomepageFilter('all');
    setOtherWorksFilter('all');
    setSearchFilter('');
  };

  // Group items by category for category view
  const getGroupedItems = () => {
    const photoItems = filteredItems.filter(item => item.media_type === 'photo');
    const videoItems = filteredItems.filter(item => item.media_type === 'video');
    
    const photoGroups: { [key: string]: PortfolioItem[] } = {};
    const videoGroups: { [key: string]: PortfolioItem[] } = {};
    
    photoItems.forEach(item => {
      const catName = getCategoryName(item.category) || 'Sem categoria';
      if (!photoGroups[catName]) photoGroups[catName] = [];
      photoGroups[catName].push(item);
    });
    
    videoItems.forEach(item => {
      const catName = getCategoryName(item.category) || 'Sem categoria';
      if (!videoGroups[catName]) videoGroups[catName] = [];
      videoGroups[catName].push(item);
    });
    
    return { photoGroups, videoGroups };
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || null;
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = filteredItems.findIndex(item => item.id === active.id);
      const newIndex = filteredItems.findIndex(item => item.id === over.id);
      
      // Update display_order for all affected items
      try {
        const reorderedItems = arrayMove(filteredItems, oldIndex, newIndex);
        const updates = reorderedItems.map((item, index) => ({
          id: item.id,
          display_order: index
        }));

        const updatePromises = updates.map(update => 
          supabase
            .from('portfolio_items')
            .update({ display_order: update.display_order })
            .eq('id', update.id)
        );

        await Promise.all(updatePromises);

        toast({
          title: 'Sucesso',
          description: 'Ordem dos itens atualizada!',
        });

        onItemsChange();
      } catch (error) {
        console.error('Error reordering items:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao reordenar itens.',
          variant: 'destructive',
        });
        onItemsChange();
      }
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Item excluído com sucesso!',
      });

      onItemsChange();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir item.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleVisibility = async (item: PortfolioItem) => {
    const newStatus = item.publish_status === 'published' ? 'hidden' : 'published';
    
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .update({ publish_status: newStatus })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Item ${newStatus === 'published' ? 'publicado' : 'ocultado'} com sucesso!`,
      });

      onItemsChange();
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar visibilidade.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleHomepage = async (item: PortfolioItem) => {
    try {
      // Verificar limite antes de adicionar
      if (!item.homepage_featured) {
        // Buscar itens atuais da homepage (excluindo o item atual)
        const { data: homepageItems, error: countError } = await supabase
          .from('portfolio_items')
          .select('media_type, id')
          .eq('homepage_featured', true)
          .neq('id', item.id);

        if (countError) throw countError;

        const photoCount = homepageItems?.filter(i => i.media_type === 'photo').length || 0;
        const videoCount = homepageItems?.filter(i => i.media_type === 'video').length || 0;

        console.log(`Tentando adicionar ${item.media_type}. Counts atuais: fotos=${photoCount}, vídeos=${videoCount}`);

        if (item.media_type === 'photo' && photoCount >= 6) {
          toast({
            title: 'Limite atingido',
            description: 'Máximo de 6 fotos podem ser destacadas na homepage.',
            variant: 'destructive',
          });
          return;
        }

        if (item.media_type === 'video' && videoCount >= 6) {
          toast({
            title: 'Limite atingido', 
            description: 'Máximo de 6 vídeos podem ser destacados na homepage.',
            variant: 'destructive',
          });
          return;
        }
      }

      const { error } = await supabase
        .from('portfolio_items')
        .update({ homepage_featured: !item.homepage_featured })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Item ${!item.homepage_featured ? 'adicionado à' : 'removido da'} homepage!`,
      });

      onItemsChange();
    } catch (error) {
      console.error('Error updating homepage featured:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar destaque da homepage.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleOtherWorks = async (item: PortfolioItem) => {
    try {
      const currentValue = (item as any).other_works_featured || false;
      
      if (!currentValue) {
        // Check limit - max 2 items
        const { data: otherWorksItems, error: countError } = await supabase
          .from('portfolio_items')
          .select('id')
          .eq('other_works_featured', true)
          .neq('id', item.id);

        if (countError) throw countError;

        if ((otherWorksItems?.length || 0) >= 2) {
          toast({
            title: 'Limite atingido',
            description: 'Máximo de 2 itens podem ser exibidos em "Outros Trabalhos".',
            variant: 'destructive',
          });
          return;
        }
      }

      const { error } = await supabase
        .from('portfolio_items')
        .update({ other_works_featured: !currentValue })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Item ${!currentValue ? 'adicionado a' : 'removido de'} Outros Trabalhos!`,
      });

      onItemsChange();
    } catch (error) {
      console.error('Error updating other works:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'hidden': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'hidden': return 'Oculto';
      default: return status;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'casamento': return 'Casamento';
      case 'aniversario': return 'Aniversário';
      case 'corporativo': return 'Corporativo';
      case 'familia': return 'Família';
      default: return category;
    }
  };

  if (editingItem) {
    return (
      <ItemEditor
        item={editingItem}
        onSave={() => {
          setEditingItem(null);
          onItemsChange();
        }}
        onCancel={() => {
          setEditingItem(null);
        }}
      />
    );
  }

  if (isCreating) {
    return (
      <NewItemCreator
        onSave={() => {
          setIsCreating(false);
          onItemsChange();
        }}
        onCancel={() => {
          setIsCreating(false);
        }}
      />
    );
  }

  if (isBatchEditing) {
    return (
      <BatchEditor
        onSave={() => {
          setIsBatchEditing(false);
          onItemsChange();
        }}
        onCancel={() => {
          setIsBatchEditing(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Itens do Portfólio</h2>
          <p className="text-muted-foreground">
            {filteredItems.length} de {items.length} {items.length === 1 ? 'item' : 'itens'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* View Type Toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <Button 
              variant={viewType === 'unified' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setViewType('unified')}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Unificado
            </Button>
            <Button 
              variant={viewType === 'by-category' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setViewType('by-category')}
            >
              <List className="h-4 w-4 mr-1" />
              Por Categoria
            </Button>
          </div>
          
          <Button 
            onClick={() => setIsDragEnabled(!isDragEnabled)}
            variant={isDragEnabled ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            <Move className="h-4 w-4" />
            <span className="hidden sm:inline">{isDragEnabled ? "Desativar" : "Reordenar"}</span>
          </Button>
          <Button 
            onClick={onItemsChange}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          <Button onClick={() => setIsCreating(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Novo</span>
          </Button>
          <Button onClick={() => setIsBatchEditing(true)} size="sm" variant="secondary">
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Alteração em Massa</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Pesquisa */}
            <div>
              <label className="text-sm font-medium">Pesquisar</label>
              <Input
                placeholder="Título ou descrição..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-10"
              />
            </div>
            
            {/* Tipo de Mídia */}
            <div>
              <label className="text-sm font-medium">Tipo de Mídia</label>
              <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="photo">📷 Fotos</SelectItem>
                  <SelectItem value="video">🎥 Vídeos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Categoria - Multi-Select */}
            <div>
              <label className="text-sm font-medium">Categorias</label>
              <CategoryMultiSelect
                categories={categories}
                selectedCategories={selectedCategories}
                onChange={setSelectedCategories}
                placeholder="Todas as categorias"
              />
            </div>
            
            {/* Subcategoria */}
            <div>
              <label className="text-sm font-medium">Subcategoria</label>
              <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Homepage */}
            <div>
              <label className="text-sm font-medium">Projetos Recentes</label>
              <Select value={homepageFilter} onValueChange={setHomepageFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="yes">🏠 Na Homepage</SelectItem>
                  <SelectItem value="no">Não na Homepage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Outros Trabalhos */}
            <div>
              <label className="text-sm font-medium">Outros Trabalhos</label>
              <Select value={otherWorksFilter} onValueChange={setOtherWorksFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="yes">📂 Em Outros Trabalhos</SelectItem>
                  <SelectItem value="no">Não em Outros Trabalhos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredItems.length === 0 ? (
        items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando alguns itens ao seu portfólio.
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            </div>
          </CardContent>
        </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os filtros para encontrar o que procura.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      ) : viewType === 'by-category' ? (
        // Category View
        <div className="space-y-8">
          {/* Photo Categories */}
          {(() => {
            const { photoGroups, videoGroups } = getGroupedItems();
            return (
              <>
                {Object.keys(photoGroups).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Camera className="h-5 w-5" />
                      <span>Fotos</span>
                    </div>
                    {Object.entries(photoGroups).map(([catName, catItems]) => (
                      <Card key={catName}>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">{catName}</CardTitle>
                          <CardDescription>{catItems.length} {catItems.length === 1 ? 'item' : 'itens'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {catItems.map((item) => (
                              <Card key={item.id} className={`overflow-hidden transition-shadow hover:shadow-lg ${item.is_featured ? 'ring-2 ring-yellow-400' : ''}`}>
                                <div className="aspect-square relative overflow-hidden bg-muted">
                                  <img
                                    src={item.thumbnail_url || item.file_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-2 right-2 flex gap-1">
                                    <Badge className={`text-xs text-white backdrop-blur-sm ${getStatusColor(item.publish_status)}`}>
                                      {getStatusText(item.publish_status)}
                                    </Badge>
                                  </div>
                                  {item.homepage_featured && (
                                    <Badge className="absolute top-2 left-2 text-xs bg-blue-500 backdrop-blur-sm">
                                      <HomeIcon className="w-3 h-3" />
                                    </Badge>
                                  )}
                                  {(item as any).other_works_featured && (
                                    <Badge className="absolute top-8 left-2 text-xs bg-purple-500 backdrop-blur-sm">
                                      <Briefcase className="w-3 h-3" />
                                    </Badge>
                                  )}
                                </div>
                                <CardContent className="p-2">
                                  <h3 className="font-medium text-xs truncate mb-2">{item.title}</h3>
                                  <div className="flex gap-1 flex-wrap">
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingItem(item)} title="Editar">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleToggleVisibility(item)} title={item.publish_status === 'published' ? 'Ocultar' : 'Publicar'}>
                                      {item.publish_status === 'published' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleToggleHomepage(item)} title={item.homepage_featured ? 'Remover de Projetos Recentes' : 'Adicionar a Projetos Recentes'}>
                                      <HomeIcon className={`h-3 w-3 ${item.homepage_featured ? 'text-blue-500' : ''}`} />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleToggleOtherWorks(item)} title={(item as any).other_works_featured ? 'Remover de Outros Trabalhos' : 'Adicionar a Outros Trabalhos'}>
                                      <Briefcase className={`h-3 w-3 ${(item as any).other_works_featured ? 'text-purple-500' : ''}`} />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" title="Excluir">
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Excluir Item</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir "{item.title}"? Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {Object.keys(videoGroups).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Video className="h-5 w-5" />
                      <span>Vídeos</span>
                    </div>
                    {Object.entries(videoGroups).map(([catName, catItems]) => (
                      <Card key={catName}>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">{catName}</CardTitle>
                          <CardDescription>{catItems.length} {catItems.length === 1 ? 'item' : 'itens'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {catItems.map((item) => (
                              <Card key={item.id} className={`overflow-hidden transition-shadow hover:shadow-lg ${item.is_featured ? 'ring-2 ring-yellow-400' : ''}`}>
                                <div className="aspect-video relative overflow-hidden bg-muted">
                                  {item.thumbnail_url ? (
                                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <video src={item.file_url} className="w-full h-full object-cover" poster={item.thumbnail_url} />
                                  )}
                                  <div className="absolute top-2 right-2 flex gap-1">
                                    <Badge variant="secondary" className="text-xs flex items-center gap-1 backdrop-blur-sm bg-background/80">
                                      <Video className="w-3 h-3" />
                                    </Badge>
                                    <Badge className={`text-xs text-white backdrop-blur-sm ${getStatusColor(item.publish_status)}`}>
                                      {getStatusText(item.publish_status)}
                                    </Badge>
                                  </div>
                                  {item.homepage_featured && (
                                    <Badge className="absolute top-2 left-2 text-xs bg-blue-500 backdrop-blur-sm">
                                      <HomeIcon className="w-3 h-3" />
                                    </Badge>
                                  )}
                                  {(item as any).other_works_featured && (
                                    <Badge className="absolute top-8 left-2 text-xs bg-purple-500 backdrop-blur-sm">
                                      <Briefcase className="w-3 h-3" />
                                    </Badge>
                                  )}
                                </div>
                                <CardContent className="p-2">
                                  <h3 className="font-medium text-xs truncate mb-2">{item.title}</h3>
                                  <div className="flex gap-1 flex-wrap">
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingItem(item)} title="Editar">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleToggleVisibility(item)} title={item.publish_status === 'published' ? 'Ocultar' : 'Publicar'}>
                                      {item.publish_status === 'published' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleToggleHomepage(item)} title={item.homepage_featured ? 'Remover de Projetos Recentes' : 'Adicionar a Projetos Recentes'}>
                                      <HomeIcon className={`h-3 w-3 ${item.homepage_featured ? 'text-blue-500' : ''}`} />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleToggleOtherWorks(item)} title={(item as any).other_works_featured ? 'Remover de Outros Trabalhos' : 'Adicionar a Outros Trabalhos'}>
                                      <Briefcase className={`h-3 w-3 ${(item as any).other_works_featured ? 'text-purple-500' : ''}`} />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" title="Excluir">
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Excluir Item</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir "{item.title}"? Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      ) : (
        // Unified View with DnD
        <DndContext
          sensors={isDragEnabled ? sensors : []}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredItems.map(item => item.id)}
            strategy={localViewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
          >
            <div className={
              localViewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
            }>
              {filteredItems.map((item) => (
                <SortableItem key={item.id} id={item.id} isDragEnabled={isDragEnabled}>
                  <Card className={`overflow-hidden transition-shadow hover:shadow-lg ${item.is_featured ? 'ring-2 ring-yellow-400' : ''}`}>
                    {localViewMode === 'grid' && (
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        {item.media_type === 'video' ? (
                          <video
                            src={item.file_url}
                            className="w-full h-full object-cover"
                            poster={item.thumbnail_url}
                          />
                        ) : (
                          <img
                            src={item.thumbnail_url || item.file_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Badge variant="secondary" className="text-xs flex items-center gap-1 backdrop-blur-sm bg-background/80">
                            {item.media_type === 'photo' ? (
                              <Camera className="w-3 h-3" />
                            ) : (
                              <Video className="w-3 h-3" />
                            )}
                          </Badge>
                          <Badge className={`text-xs text-white backdrop-blur-sm ${getStatusColor(item.publish_status)}`}>
                            {getStatusText(item.publish_status)}
                          </Badge>
                        </div>
                        {item.homepage_featured && (
                          <Badge className="absolute top-2 left-2 text-xs bg-blue-500 backdrop-blur-sm">
                            <HomeIcon className="w-3 h-3" />
                          </Badge>
                        )}
                      </div>
                    )}
                    <CardContent className={localViewMode === 'grid' ? 'p-3' : 'p-3 flex items-center gap-4'}>
                      {localViewMode === 'list' && (
                        <div className="flex-shrink-0">
                          {item.media_type === 'video' ? (
                            <video
                              src={item.file_url}
                              className="w-14 h-14 object-cover rounded"
                              poster={item.thumbnail_url}
                            />
                          ) : (
                            <img
                              src={item.thumbnail_url || item.file_url}
                              alt={item.title}
                              className="w-14 h-14 object-cover rounded"
                            />
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        )}
                        {localViewMode === 'list' && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Badge variant="secondary" className="text-xs">
                              {item.media_type === 'photo' ? '📷' : '🎥'}
                            </Badge>
                            <Badge className={`text-xs text-white ${getStatusColor(item.publish_status)}`}>
                              {getStatusText(item.publish_status)}
                            </Badge>
                            {item.homepage_featured && (
                              <Badge variant="default" className="text-xs bg-blue-500">
                                HP
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingItem(item)}
                          title="Editar"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleVisibility(item)}
                          title={item.publish_status === 'published' ? 'Ocultar' : 'Publicar'}
                          className="h-8 w-8 p-0"
                        >
                          {item.publish_status === 'published' ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleHomepage(item)}
                          title={item.homepage_featured ? 'Remover de Projetos Recentes' : 'Adicionar a Projetos Recentes'}
                          className="h-8 w-8 p-0"
                        >
                          <HomeIcon className={`h-3.5 w-3.5 ${item.homepage_featured ? 'text-blue-500' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleOtherWorks(item)}
                          title={(item as any).other_works_featured ? 'Remover de Outros Trabalhos' : 'Adicionar a Outros Trabalhos'}
                          className="h-8 w-8 p-0"
                        >
                          <Briefcase className={`h-3.5 w-3.5 ${(item as any).other_works_featured ? 'text-purple-500' : ''}`} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Excluir"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir "{item.title}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}