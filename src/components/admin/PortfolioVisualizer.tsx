import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/admin/SortableItem';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Eye, EyeOff, Home, Palette } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  media_type: 'photo' | 'video';
  file_url: string;
  thumbnail_url?: string;
  category: string;
  subcategory?: string;
  publish_status: 'draft' | 'published' | 'hidden';
  is_featured: boolean;
  display_order: number;
  homepage_featured: boolean;
  created_at: string;
}

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

export function PortfolioVisualizer() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'homepage'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [itemsResponse, categoriesResponse, subcategoriesResponse] = await Promise.all([
        supabase
          .from('portfolio_items')
          .select('*')
          .eq('publish_status', 'published')
          .order('display_order'),
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

      if (itemsResponse.error) throw itemsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;
      if (subcategoriesResponse.error) throw subcategoriesResponse.error;

      setItems((itemsResponse.data || []).map(item => ({
        ...item,
        media_type: item.media_type as 'photo' | 'video',
        publish_status: item.publish_status as 'draft' | 'published' | 'hidden'
      })));
      setCategories((categoriesResponse.data || []).map(cat => ({
        ...cat,
        type: cat.type as 'photo' | 'video'
      })));
      setSubcategories(subcategoriesResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do portfólio.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredItems.findIndex(item => item.id === active.id);
      const newIndex = filteredItems.findIndex(item => item.id === over.id);
      
      const newFilteredItems = arrayMove(filteredItems, oldIndex, newIndex);
      
      // Update the display_order for the reordered items
      const updatedItems = items.map(item => {
        const itemIndex = newFilteredItems.findIndex(fi => fi.id === item.id);
        if (itemIndex !== -1) {
          return { ...item, display_order: itemIndex + 1 };
        }
        return item;
      });
      
      setItems(updatedItems);
      setHasUnsavedChanges(true);
    }
  };

  const handleToggleHomepageFeatured = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const newHomepageFeatured = !item.homepage_featured;

      const { error } = await supabase
        .from('portfolio_items')
        .update({ homepage_featured: newHomepageFeatured })
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId 
          ? { ...item, homepage_featured: newHomepageFeatured }
          : item
      ));

      toast({
        title: 'Sucesso',
        description: `Item ${newHomepageFeatured ? 'adicionado à' : 'removido da'} homepage.`,
      });
    } catch (error) {
      console.error('Error toggling homepage featured:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar item.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveOrder = async () => {
    try {
      const updates = filteredItems.map((item, index) => ({
        id: item.id,
        display_order: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('portfolio_items')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      setHasUnsavedChanges(false);
      toast({
        title: 'Sucesso',
        description: 'Ordem dos itens salva com sucesso!',
      });
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar ordem dos itens.',
        variant: 'destructive',
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    return subcategory ? subcategory.name : subcategoryId;
  };

  const filteredItems = items.filter(item => {
    if (viewMode === 'homepage' && !item.homepage_featured) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedSubcategory !== 'all' && item.subcategory !== selectedSubcategory) return false;
    return true;
  });

  const availableSubcategories = selectedCategory !== 'all' 
    ? subcategories.filter(s => {
        const category = categories.find(c => c.id === selectedCategory);
        return category && s.category_id === category.id;
      })
    : [];

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
          <h2 className="text-2xl font-semibold">Visualização & Ordenação</h2>
          <p className="text-muted-foreground">
            Organize e selecione itens para o portfólio
          </p>
        </div>
        {hasUnsavedChanges && (
          <Button onClick={handleSaveOrder}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Ordem
          </Button>
        )}
      </div>

      {/* Filters and View Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Filtros e Visualização
          </CardTitle>
          <CardDescription>
            Filtre e organize os itens do portfólio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="view-mode">Modo de Visualização</Label>
              <Select value={viewMode} onValueChange={(value: 'all' | 'homepage') => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Itens</SelectItem>
                  <SelectItem value="homepage">Apenas Homepage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category-filter">Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.type === 'photo' ? 'Foto' : 'Vídeo'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subcategory-filter">Subcategoria</Label>
              <Select 
                value={selectedSubcategory} 
                onValueChange={setSelectedSubcategory}
                disabled={selectedCategory === 'all'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {availableSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Badge variant="outline" className="h-10 flex items-center">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'itens'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Items */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Portfólio</CardTitle>
          <CardDescription>
            Arraste e solte para reordenar. Use os switches para controlar a exibição na homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum item encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredItems.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <SortableItem key={item.id} id={item.id}>
                      <Card className="overflow-hidden">
                        <div className="aspect-video relative bg-muted">
                          {item.media_type === 'photo' ? (
                            <img
                              src={item.thumbnail_url || item.file_url}
                              alt={item.title}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
                                  </svg>
                                </div>
                                <p className="text-sm font-medium">Vídeo</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium line-clamp-1">{item.title}</h4>
                              {item.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">
                                {getCategoryName(item.category)}
                              </Badge>
                              {item.subcategory && (
                                <Badge variant="secondary" className="text-xs">
                                  {getSubcategoryName(item.subcategory)}
                                </Badge>
                              )}
                              <Badge variant={item.media_type === 'photo' ? 'default' : 'secondary'} className="text-xs">
                                {item.media_type === 'photo' ? 'Foto' : 'Vídeo'}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`homepage-${item.id}`}
                                  checked={item.homepage_featured}
                                  onCheckedChange={() => handleToggleHomepageFeatured(item.id)}
                                />
                                <Label htmlFor={`homepage-${item.id}`} className="text-sm">
                                  Homepage
                                </Label>
                              </div>
                              <div className="flex items-center gap-1">
                                {item.homepage_featured && (
                                  <Badge variant="default" className="text-xs">
                                    <Home className="h-3 w-3 mr-1" />
                                    Homepage
                                  </Badge>
                                )}
                                {item.is_featured && (
                                  <Badge variant="secondary" className="text-xs">
                                    Destaque
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}