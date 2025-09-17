import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MediaSelector } from './MediaSelector';
import { useAdmin } from '@/hooks/useAdmin';
import { Plus, Edit, Trash2, Save, X, Star, Quote, Image as ImageIcon, Palette } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  event: string;
  rating: number;
  text: string;
  image?: string;
  background_image?: string;
  background_opacity: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface TestimonialBackground {
  id: string;
  name: string;
  file_url: string;
  thumbnail_url?: string;
  is_active: boolean;
  display_order: number;
}

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [backgrounds, setBackgrounds] = useState<TestimonialBackground[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTestimonialData, setNewTestimonialData] = useState({
    name: '',
    event: '',
    rating: 5,
    text: '',
    image: '',
    background_image: '',
    background_opacity: 0.3,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAdmin();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [testimonialsResponse, backgroundsResponse] = await Promise.all([
        supabase
          .from('testimonials')
          .select('*')
          .order('display_order'),
        supabase
          .from('testimonial_backgrounds')
          .select('*')
          .order('display_order')
      ]);

      if (testimonialsResponse.error) throw testimonialsResponse.error;
      if (backgroundsResponse.error) throw backgroundsResponse.error;

      setTestimonials(testimonialsResponse.data || []);
      setBackgrounds(backgroundsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar depoimentos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTestimonialData.name.trim() || !newTestimonialData.text.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome e texto são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('testimonials')
        .insert({
          ...newTestimonialData,
          display_order: testimonials.length,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Depoimento criado com sucesso!',
      });
      
      setNewTestimonialData({
        name: '',
        event: '',
        rating: 5,
        text: '',
        image: '',
        background_image: '',
        background_opacity: 0.3,
      });
      setIsCreating(false);
      loadData();
    } catch (error) {
      console.error('Error creating testimonial:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar depoimento.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (testimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({
          name: testimonial.name,
          event: testimonial.event,
          rating: testimonial.rating,
          text: testimonial.text,
          image: testimonial.image,
          background_image: testimonial.background_image,
          background_opacity: testimonial.background_opacity,
          is_active: testimonial.is_active,
        })
        .eq('id', testimonial.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Depoimento atualizado com sucesso!',
      });
      
      setEditingTestimonial(null);
      loadData();
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar depoimento.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (testimonialId: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', testimonialId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Depoimento excluído com sucesso!',
      });
      
      loadData();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir depoimento.',
        variant: 'destructive',
      });
    }
  };

  const addBackgroundToLibrary = async (fileUrl: string, thumbnailUrl?: string) => {
    try {
      const { error } = await supabase
        .from('testimonial_backgrounds')
        .insert({
          name: `Background ${backgrounds.length + 1}`,
          file_url: fileUrl,
          thumbnail_url: thumbnailUrl,
          display_order: backgrounds.length,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Imagem adicionada à biblioteca de depoimentos!',
      });

      loadData();
    } catch (error) {
      console.error('Error adding background:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar imagem.',
        variant: 'destructive',
      });
    }
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `testimonial-bg-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(fileName);

      await addBackgroundToLibrary(publicUrl);
      
      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading background:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload da imagem.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
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
          <p className="text-muted-foreground">Você precisa estar logado como admin para gerenciar depoimentos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Quote className="h-6 w-6" />
            Gerenciar Depoimentos
          </h2>
          <p className="text-muted-foreground">
            Crie e gerencie depoimentos de clientes com imagens de fundo personalizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBackgrounds(!showBackgrounds)}
            size="sm"
          >
            <Palette className="h-4 w-4 mr-2" />
            {showBackgrounds ? 'Ocultar' : 'Ver'} Fundos
          </Button>
          <Button
            onClick={() => setIsCreating(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Depoimento
          </Button>
        </div>
      </div>

      {/* Backgrounds Library */}
      {showBackgrounds && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Biblioteca de Fundos para Depoimentos
            </CardTitle>
            <CardDescription>
              Imagens disponíveis para usar como fundo dos depoimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button
                onClick={() => document.getElementById('background-upload')?.click()}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Imagem
              </Button>
              <input
                id="background-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBackgroundUpload}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {backgrounds.map((bg) => (
                <div key={bg.id} className="relative group">
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <img
                      src={bg.thumbnail_url || bg.file_url}
                      alt={bg.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{bg.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Testimonial */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Depoimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Cliente</Label>
                <Input
                  id="name"
                  value={newTestimonialData.name}
                  onChange={(e) => setNewTestimonialData({ ...newTestimonialData, name: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <Label htmlFor="event">Evento/Serviço</Label>
                <Input
                  id="event"
                  value={newTestimonialData.event}
                  onChange={(e) => setNewTestimonialData({ ...newTestimonialData, event: e.target.value })}
                  placeholder="Ex: Casamento - Dezembro 2023"
                />
              </div>
              <div>
                <Label htmlFor="rating">Avaliação</Label>
                <Select
                  value={newTestimonialData.rating.toString()}
                  onValueChange={(value) => setNewTestimonialData({ ...newTestimonialData, rating: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        <div className="flex items-center gap-1">
                          {[...Array(rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current text-primary" />
                          ))}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image">URL da Foto do Cliente</Label>
                <Input
                  id="image"
                  value={newTestimonialData.image}
                  onChange={(e) => setNewTestimonialData({ ...newTestimonialData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="text">Depoimento</Label>
                <Textarea
                  id="text"
                  value={newTestimonialData.text}
                  onChange={(e) => setNewTestimonialData({ ...newTestimonialData, text: e.target.value })}
                  placeholder="Texto do depoimento..."
                  rows={4}
                />
              </div>
                <Label htmlFor="background_image">Imagem de Fundo</Label>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMediaSelector(!showMediaSelector)}
                    className="w-full"
                  >
                    {newTestimonialData.background_image ? 'Alterar Fundo' : 'Selecionar Fundo'}
                  </Button>
                  {newTestimonialData.background_image && (
                    <div className="relative">
                      <img
                        src={newTestimonialData.background_image}
                        alt="Fundo selecionado"
                        className="w-full h-24 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setNewTestimonialData(prev => ({ ...prev, background_image: '' }))}
                        className="absolute top-1 right-1"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
              <div>
                <Label>Opacidade do Fundo: {Math.round(newTestimonialData.background_opacity * 100)}%</Label>
                <Slider
                  value={[newTestimonialData.background_opacity * 100]}
                  onValueChange={([value]) => setNewTestimonialData({ ...newTestimonialData, background_opacity: value / 100 })}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button onClick={handleCreate}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
            
            {showMediaSelector && (
              <div className="mt-4">
                <MediaSelector
                  onSelect={(media) => {
                    setNewTestimonialData(prev => ({ ...prev, background_image: media.file_url }));
                    setShowMediaSelector(false);
                  }}
                  filterByType="photo"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Testimonials List */}
      <div className="grid grid-cols-1 gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardContent className="p-6">
              {editingTestimonial?.id === testimonial.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome do Cliente</Label>
                      <Input
                        value={editingTestimonial.name}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Evento/Serviço</Label>
                      <Input
                        value={editingTestimonial.event}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, event: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Avaliação</Label>
                      <Select
                        value={editingTestimonial.rating.toString()}
                        onValueChange={(value) => setEditingTestimonial({ ...editingTestimonial, rating: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              <div className="flex items-center gap-1">
                                {[...Array(rating)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-current text-primary" />
                                ))}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>URL da Foto</Label>
                      <Input
                        value={editingTestimonial.image || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, image: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Depoimento</Label>
                      <Textarea
                        value={editingTestimonial.text}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Imagem de Fundo</Label>
                      <Select
                        value={editingTestimonial.background_image || 'none'}
                        onValueChange={(value) => setEditingTestimonial({ 
                          ...editingTestimonial, 
                          background_image: value === 'none' ? null : value 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar fundo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum fundo</SelectItem>
                          {backgrounds.map((bg) => (
                            <SelectItem key={bg.id} value={bg.file_url}>
                              {bg.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Opacidade: {Math.round(editingTestimonial.background_opacity * 100)}%</Label>
                      <Slider
                        value={[editingTestimonial.background_opacity * 100]}
                        onValueChange={([value]) => setEditingTestimonial({ ...editingTestimonial, background_opacity: value / 100 })}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingTestimonial.is_active}
                          onCheckedChange={(checked) => setEditingTestimonial({ ...editingTestimonial, is_active: checked })}
                        />
                        <Label>Ativo</Label>
                      </div>
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Button onClick={() => handleUpdate(editingTestimonial)}>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setEditingTestimonial(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  {/* Preview with background */}
                  <div className="flex-shrink-0">
                    <div 
                      className="w-48 h-32 relative overflow-hidden rounded-lg"
                      style={{
                        backgroundImage: testimonial.background_image ? `url(${testimonial.background_image})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {testimonial.background_image && (
                        <div 
                          className="absolute inset-0 bg-black"
                          style={{ opacity: testimonial.background_opacity }}
                        />
                      )}
                      <div className="relative z-10 p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          {testimonial.image && (
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img
                                src={testimonial.image}
                                alt={testimonial.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-sm">{testimonial.name}</div>
                            <div className="text-xs opacity-80">{testimonial.event}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current text-primary" />
                          ))}
                        </div>
                        <p className="text-xs line-clamp-3">{testimonial.text}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                        <p className="text-muted-foreground">{testimonial.event}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current text-primary" />
                            ))}
                          </div>
                          <Badge variant={testimonial.is_active ? "default" : "secondary"}>
                            {testimonial.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingTestimonial(testimonial)}>
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
                                Tem certeza que deseja excluir o depoimento de "{testimonial.name}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(testimonial.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{testimonial.text}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Quote className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum depoimento</h3>
            <p className="text-muted-foreground text-center">
              Comece criando o primeiro depoimento de cliente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}