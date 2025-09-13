import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Image, Video, Check } from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  filename?: string;
  media_type: 'photo' | 'video';
  file_url: string;
  thumbnail_url?: string;
  file_size?: number;
  dimensions?: { width: number; height: number };
  created_at: string;
}

interface MediaSelectorProps {
  onSelect: (mediaItem: MediaItem) => void;
  selectedMediaId?: string;
  filterByType?: 'photo' | 'video';
  refreshTrigger?: number;
}

export function MediaSelector({ onSelect, selectedMediaId, filterByType, refreshTrigger }: MediaSelectorProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'photo' | 'video'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadMediaItems();
  }, [refreshTrigger]);

  useEffect(() => {
    // Auto-refresh every 5 seconds to check for new uploads
    const interval = setInterval(() => {
      loadMediaItems();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (filterByType) {
      setTypeFilter(filterByType);
    }
  }, [filterByType]);

  useEffect(() => {
    filterItems();
  }, [mediaItems, searchTerm, typeFilter]);

  const loadMediaItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('temp_media')
        .select('id, filename, media_type, file_url, thumbnail_url, file_size, dimensions, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaItems((data || []).map(item => ({
        ...item,
        title: item.filename.replace(/\.[^/.]+$/, ''), // Use filename without extension as title
        media_type: item.media_type as 'photo' | 'video',
        dimensions: item.dimensions as { width: number; height: number } | undefined
      })));
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

  const filterItems = () => {
    let filtered = mediaItems;

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.media_type === typeFilter);
    }

    // Apply external filter if provided
    if (filterByType) {
      filtered = filtered.filter(item => item.media_type === filterByType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Carregando mídias...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecionar Mídia</CardTitle>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {!filterByType && (
            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
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
        </div>
      </CardHeader>
      <CardContent>
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {mediaItems.length === 0 
                ? 'Nenhuma mídia encontrada. Faça upload de algumas mídias primeiro.'
                : 'Nenhuma mídia encontrada com os filtros aplicados.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedMediaId === item.id 
                    ? 'ring-2 ring-primary shadow-md' 
                    : ''
                }`}
                onClick={() => onSelect(item)}
              >
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  {item.media_type === 'video' ? (
                    <video
                      src={item.file_url}
                      poster={item.thumbnail_url}
                      className="w-full h-full object-cover"
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
                      {item.media_type === 'photo' ? (
                        <Image className="h-3 w-3" />
                      ) : (
                        <Video className="h-3 w-3" />
                      )}
                    </Badge>
                    {selectedMediaId === item.id && (
                      <Badge className="text-xs bg-primary">
                        <Check className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm truncate mb-1">{item.title}</h4>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.created_at)}
                    </p>
                    {item.file_size && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.file_size)}
                      </p>
                    )}
                    {item.dimensions && (
                      <p className="text-xs text-muted-foreground">
                        {item.dimensions.width} × {item.dimensions.height}
                      </p>
                    )}
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