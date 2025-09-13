import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { ItemEditor } from './ItemEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
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

interface PortfolioManagerProps {
  items: PortfolioItem[];
  viewMode: 'grid' | 'list';
  onItemsChange: () => void;
}

export function PortfolioManager({ items, viewMode, onItemsChange }: PortfolioManagerProps) {
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      const reorderedItems = arrayMove(items, oldIndex, newIndex);
      
      // Update display_order for all affected items
      try {
        const updates = reorderedItems.map((item, index) => ({
          id: item.id,
          display_order: index
        }));

        for (const update of updates) {
          await supabase
            .from('portfolio_items')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        toast({
          title: 'Sucesso',
          description: 'Ordem dos itens atualizada com sucesso!',
        });

        onItemsChange();
      } catch (error) {
        console.error('Error reordering items:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao reordenar itens.',
          variant: 'destructive',
        });
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

  if (editingItem || isCreating) {
    return (
      <ItemEditor
        item={isCreating ? null : editingItem}
        onSave={() => {
          setEditingItem(null);
          setIsCreating(false);
          onItemsChange();
        }}
        onCancel={() => {
          setEditingItem(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Itens do Portfólio</h2>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item encontrado' : 'itens encontrados'}
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(item => item.id)}
            strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
          >
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id}>
                  <Card className="overflow-hidden">
                    {viewMode === 'grid' && (
                      <div className="aspect-video relative overflow-hidden">
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
                          <Badge variant="secondary" className="text-xs">
                            {item.media_type === 'photo' ? '📷' : '🎥'}
                          </Badge>
                          <Badge className={`text-xs text-white ${getStatusColor(item.publish_status)}`}>
                            {getStatusText(item.publish_status)}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center gap-4'}>
                      {viewMode === 'list' && (
                        <div className="flex-shrink-0">
                          {item.media_type === 'video' ? (
                            <video
                              src={item.file_url}
                              className="w-16 h-16 object-cover rounded"
                              poster={item.thumbnail_url}
                            />
                          ) : (
                            <img
                              src={item.thumbnail_url || item.file_url}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryText(item.category)}
                          </Badge>
                          {viewMode === 'list' && (
                            <>
                              <Badge variant="secondary" className="text-xs">
                                {item.media_type === 'photo' ? '📷' : '🎥'}
                              </Badge>
                              <Badge className={`text-xs text-white ${getStatusColor(item.publish_status)}`}>
                                {getStatusText(item.publish_status)}
                              </Badge>
                            </>
                          )}
                          {item.is_featured && (
                            <Badge variant="default" className="text-xs">
                              ⭐ Destaque
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleVisibility(item)}
                        >
                          {item.publish_status === 'published' ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
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
                                className="bg-red-600 hover:bg-red-700"
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