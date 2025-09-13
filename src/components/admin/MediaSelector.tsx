import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

interface MediaItem {
  id: string;
  title: string;
  media_type: 'photo' | 'video';
  file_url: string;
  thumbnail_url?: string;
  file_size?: number;
  dimensions?: { width: number; height: number };
  created_at: string;
  item_status: string;
}

interface MediaSelectorProps {
  onSelect: (media: MediaItem) => void;
  selectedMediaId?: string;
  filterByType?: 'photo' | 'video';
  refreshTrigger?: number;
}

export function MediaSelector({ 
  onSelect, 
  selectedMediaId, 
  filterByType,
  refreshTrigger = 0 
}: MediaSelectorProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { toast } = useToast();

  const loadMediaItems = async () => {
    try {
      setIsLoading(true);
      console.log('Loading media items...');
      
  const { data, error } = await supabase
        .from('portfolio_items')
        .select('id, title, media_type, file_url, thumbnail_url, file_size, dimensions, created_at, item_status')
        .in('item_status', ['uploaded', 'published']) // Include both uploaded and published items
        .order('created_at', { ascending: false });

      console.log('Media query result:', { data, error });

      if (error) throw error;
      
      const mappedItems = (data || []).map(item => ({
        ...item,
        media_type: item.media_type as 'photo' | 'video',
        dimensions: item.dimensions as { width: number; height: number } | undefined
      }));
      
      console.log('Mapped media items:', mappedItems);
      setMediaItems(mappedItems);
    } catch (error) {
      console.error('Error loading media items:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar mídias.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only load on mount and when refreshTrigger changes manually
  useEffect(() => {
    loadMediaItems();
  }, [refreshTrigger]);

  // Separate effect for filtering
  useEffect(() => {
    if (filterByType) {
      setTypeFilter(filterByType);
    }
  }, [filterByType]);

  useEffect(() => {
    let filtered = mediaItems;

    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.media_type === typeFilter);
    }

    setFilteredItems(filtered);
  }, [mediaItems, searchTerm, typeFilter]);


  const handleEdit = (item: MediaItem) => {
    // TODO: Implementar modal de edição de mídia
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: 'A edição de mídia será implementada em breve.',
    });
  };

  const handleToggleStatus = async (item: MediaItem) => {
    const newStatus = item.item_status === 'uploaded' ? 'published' : 'uploaded';
    
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .update({ item_status: newStatus })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Status alterado para ${newStatus === 'uploaded' ? 'mídia' : 'item publicado'}!`,
      });

      // Atualizar o item localmente sem recarregar toda a lista
      setMediaItems(prevItems => 
        prevItems.map(prevItem => 
          prevItem.id === item.id 
            ? { ...prevItem, item_status: newStatus }
            : prevItem
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      // Primeiro, buscar o item para obter a URL do arquivo
      const { data: item, error: fetchError } = await supabase
        .from('portfolio_items')
        .select('file_url')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;

      // Extrair o caminho do arquivo da URL
      if (item?.file_url && item.file_url.includes('portfolio-media/')) {
        const filePath = item.file_url.split('portfolio-media/')[1];
        
        // Deletar o arquivo do storage
        const { error: storageError } = await supabase.storage
          .from('portfolio-media')
          .remove([filePath]);

        if (storageError) {
          console.warn('Erro ao deletar arquivo do storage:', storageError);
        }
      }

      // Deletar o registro da base de dados
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Mídia excluída com sucesso!',
      });

      // Atualizar a lista localmente
      setMediaItems(prevItems => prevItems.filter(prevItem => prevItem.id !== itemId));
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir mídia.',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return 'N/A';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando mídia...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Biblioteca de Mídia</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadMediaItems()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex gap-2">
          {!filterByType && (
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="photo">Fotos</SelectItem>
                <SelectItem value="video">Vídeos</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Input
            placeholder="Buscar mídia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Grid de mídia */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {mediaItems.length === 0 
              ? 'Nenhuma mídia encontrada.' 
              : 'Nenhuma mídia corresponde aos filtros.'
            }
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedMediaId === item.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelect(item)}
              >
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
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
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.media_type === 'photo' ? '📷' : '🎥'}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.created_at)} • {formatFileSize(item.file_size)}
                        {item.dimensions && (
                          <> • {item.dimensions.width}×{item.dimensions.height}</>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                        title="Editar"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(item);
                        }}
                        title={item.item_status === 'uploaded' ? 'Publicar item' : 'Manter como mídia'}
                        className="h-8 w-8 p-0"
                      >
                        {item.item_status === 'uploaded' ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Excluir"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Mídia</AlertDialogTitle>
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
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}