import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { MediaUploader } from './MediaUploader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Eye, EyeOff, Move, Upload, Palette } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
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

interface HomepageBackground {
  id: string;
  name: string;
  file_url: string;
  thumbnail_url?: string;
  opacity: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function HomepageBackgroundManager() {
  const [backgrounds, setBackgrounds] = useState<HomepageBackground[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(false);
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

  useEffect(() => {
    loadBackgrounds();
  }, []);

  const loadBackgrounds = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_backgrounds')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setBackgrounds(data || []);
    } catch (error) {
      console.error('Error loading backgrounds:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar imagens de fundo.',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = backgrounds.findIndex(bg => bg.id === active.id);
      const newIndex = backgrounds.findIndex(bg => bg.id === over.id);
      
      try {
        const reorderedBackgrounds = arrayMove(backgrounds, oldIndex, newIndex);
        const updates = reorderedBackgrounds.map((bg, index) => ({
          id: bg.id,
          display_order: index
        }));

        const updatePromises = updates.map(update => 
          supabase
            .from('homepage_backgrounds')
            .update({ display_order: update.display_order })
            .eq('id', update.id)
        );

        await Promise.all(updatePromises);
        setBackgrounds(reorderedBackgrounds);

        toast({
          title: 'Sucesso',
          description: 'Ordem das imagens atualizada!',
        });
      } catch (error) {
        console.error('Error reordering backgrounds:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao reordenar imagens.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleUploadSuccess = async (fileUrl: string, thumbnailUrl?: string) => {
    try {
      const maxOrder = Math.max(...backgrounds.map(bg => bg.display_order), -1);
      
      const { error } = await supabase
        .from('homepage_backgrounds')
        .insert({
          name: `Background ${backgrounds.length + 1}`,
          file_url: fileUrl,
          thumbnail_url: thumbnailUrl,
          opacity: 0.5,
          display_order: maxOrder + 1,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Imagem de fundo adicionada com sucesso!',
      });

      loadBackgrounds();
    } catch (error) {
      console.error('Error adding background:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar imagem de fundo.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateOpacity = async (id: string, opacity: number) => {
    try {
      const { error } = await supabase
        .from('homepage_backgrounds')
        .update({ opacity: opacity / 100 })
        .eq('id', id);

      if (error) throw error;

      setBackgrounds(prev => prev.map(bg => 
        bg.id === id ? { ...bg, opacity: opacity / 100 } : bg
      ));
    } catch (error) {
      console.error('Error updating opacity:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar opacidade.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateName = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('homepage_backgrounds')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      setBackgrounds(prev => prev.map(bg => 
        bg.id === id ? { ...bg, name } : bg
      ));

      toast({
        title: 'Sucesso',
        description: 'Nome atualizado com sucesso!',
      });
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar nome.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('homepage_backgrounds')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      setBackgrounds(prev => prev.map(bg => 
        bg.id === id ? { ...bg, is_active: !isActive } : bg
      ));

      toast({
        title: 'Sucesso',
        description: `Imagem ${!isActive ? 'ativada' : 'desativada'} com sucesso!`,
      });
    } catch (error) {
      console.error('Error toggling active:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status da imagem.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('homepage_backgrounds')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Imagem de fundo excluída com sucesso!',
      });

      loadBackgrounds();
    } catch (error) {
      console.error('Error deleting background:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir imagem de fundo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Fundos da Homepage
          </h2>
          <p className="text-muted-foreground">
            Gerencie as imagens de fundo da homepage com transições suaves
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsDragEnabled(!isDragEnabled)}
            variant={isDragEnabled ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            <Move className="h-4 w-4" />
            {isDragEnabled ? "Desativar ordenação" : "Ativar ordenação"}
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Adicionar Nova Imagem de Fundo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUploader
            onUploadComplete={() => {
              setIsUploading(false);
              loadBackgrounds();
            }}
          />
        </CardContent>
      </Card>

      {backgrounds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma imagem de fundo</h3>
              <p className="text-muted-foreground mb-4">
                Adicione imagens para criar um slideshow de fundo na homepage.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={isDragEnabled ? sensors : []}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={backgrounds.map(bg => bg.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {backgrounds.map((background) => (
                <SortableItem key={background.id} id={background.id} isDragEnabled={isDragEnabled}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Preview */}
                        <div className="flex-shrink-0">
                          <div className="w-32 h-20 relative overflow-hidden rounded-lg">
                            <img
                              src={background.thumbnail_url || background.file_url}
                              alt={background.name}
                              className="w-full h-full object-cover"
                              style={{ opacity: background.opacity }}
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {Math.round(background.opacity * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-4">
                          {/* Name Input */}
                          <div>
                            <Label htmlFor={`name-${background.id}`}>Nome</Label>
                            <Input
                              id={`name-${background.id}`}
                              value={background.name}
                              onChange={(e) => handleUpdateName(background.id, e.target.value)}
                              onBlur={(e) => handleUpdateName(background.id, e.target.value)}
                              className="max-w-xs"
                            />
                          </div>

                          {/* Opacity Slider */}
                          <div>
                            <Label>Opacidade: {Math.round(background.opacity * 100)}%</Label>
                            <div className="max-w-xs">
                              <Slider
                                value={[background.opacity * 100]}
                                onValueChange={([value]) => handleUpdateOpacity(background.id, value)}
                                max={100}
                                min={0}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </div>

                          {/* Status */}
                          <div className="flex items-center gap-2">
                            <Badge variant={background.is_active ? "default" : "secondary"}>
                              {background.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Badge variant="outline">
                              Ordem: {background.display_order + 1}
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(background.id, background.is_active)}
                            title={background.is_active ? 'Desativar' : 'Ativar'}
                          >
                            {background.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" title="Excluir">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Imagem de Fundo</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir "{background.name}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(background.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {backgrounds.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Palette className="h-4 w-4" />
              <span>
                {backgrounds.filter(bg => bg.is_active).length} de {backgrounds.length} imagens ativas no slideshow
              </span>
              {backgrounds.filter(bg => bg.is_active).length > 1 && (
                <Badge variant="outline" className="text-xs">
                  Transição automática ativada
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}