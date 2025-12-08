import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus, Pencil, Trash2, Save, X, Link as LinkIcon, Upload, Cloud, Loader2, Check, Image } from 'lucide-react';
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
import { useDropzone } from 'react-dropzone';
import { uploadMultipleToGCS, type GCSUploadResult } from '@/lib/gcs';

interface Event {
  id: string;
  title: string;
  default_price_cents: number;
}

interface Photo {
  id: string;
  event_id: string | null;
  title: string | null;
  description: string | null;
  url: string;
  thumb_url: string | null;
  price_cents: number | null;
  is_active: boolean;
  display_order: number;
  fotofacil_events?: Event | null;
}

export function FotoFacilPhotosManager() {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importUrls, setImportUrls] = useState('');
  const [importEventId, setImportEventId] = useState('');
  
  // GCS Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0, currentFile: '' });
  const [uploadResults, setUploadResults] = useState<GCSUploadResult[]>([]);
  
  const [formData, setFormData] = useState({
    event_id: '',
    title: '',
    description: '',
    url: '',
    thumb_url: '',
    price_cents: 0,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [selectedEventId]);

  const loadData = async () => {
    setIsLoading(true);
    
    const { data: eventsData, error: eventsError } = await supabase
      .from('fotofacil_events')
      .select('id, title, default_price_cents')
      .order('title');

    if (!eventsError) {
      setEvents(eventsData || []);
    }
    
    await loadPhotos();
    setIsLoading(false);
  };

  const loadPhotos = async () => {
    let query = supabase
      .from('fotofacil_photos')
      .select('*, fotofacil_events(id, title, default_price_cents)')
      .order('display_order', { ascending: true });

    if (selectedEventId && selectedEventId !== 'all') {
      query = query.eq('event_id', selectedEventId);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      toast({ title: 'Erro ao carregar fotos', variant: 'destructive' });
    } else {
      setPhotos(data || []);
    }
  };

  const openCreateDialog = () => {
    setEditingPhoto(null);
    setFormData({
      event_id: selectedEventId !== 'all' ? selectedEventId : '',
      title: '',
      description: '',
      url: '',
      thumb_url: '',
      price_cents: 0,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (photo: Photo) => {
    setEditingPhoto(photo);
    setFormData({
      event_id: photo.event_id || '',
      title: photo.title || '',
      description: photo.description || '',
      url: photo.url,
      thumb_url: photo.thumb_url || '',
      price_cents: photo.price_cents || 0,
      is_active: photo.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.url.trim() || !formData.event_id) {
      toast({ title: 'URL e evento são obrigatórios', variant: 'destructive' });
      return;
    }

    const photoData = {
      event_id: formData.event_id,
      title: formData.title || null,
      description: formData.description || null,
      url: formData.url,
      thumb_url: formData.thumb_url || null,
      price_cents: formData.price_cents > 0 ? formData.price_cents : null,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    };

    if (editingPhoto) {
      const { error } = await supabase
        .from('fotofacil_photos')
        .update(photoData)
        .eq('id', editingPhoto.id);

      if (error) {
        toast({ title: 'Erro ao atualizar foto', variant: 'destructive' });
      } else {
        toast({ title: 'Foto atualizada!' });
        setIsDialogOpen(false);
        loadPhotos();
      }
    } else {
      const maxOrder = photos.length > 0 ? Math.max(...photos.map(p => p.display_order ?? 0)) : 0;
      
      const { error } = await supabase
        .from('fotofacil_photos')
        .insert({ ...photoData, display_order: maxOrder + 1 });

      if (error) {
        toast({ title: 'Erro ao criar foto', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Foto adicionada!' });
        setIsDialogOpen(false);
        loadPhotos();
      }
    }
  };

  const handleImport = async () => {
    if (!importEventId) {
      toast({ title: 'Selecione um evento', variant: 'destructive' });
      return;
    }

    const urls = importUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0 && url.startsWith('http'));

    if (urls.length === 0) {
      toast({ title: 'Nenhuma URL válida encontrada', variant: 'destructive' });
      return;
    }

    const maxOrder = photos.length > 0 ? Math.max(...photos.map(p => p.display_order ?? 0)) : 0;

    const photosToInsert = urls.map((url, index) => ({
      event_id: importEventId,
      url,
      thumb_url: url,
      is_active: true,
      display_order: maxOrder + index + 1,
    }));

    const { error } = await supabase
      .from('fotofacil_photos')
      .insert(photosToInsert);

    if (error) {
      toast({ title: 'Erro ao importar fotos', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `${urls.length} fotos importadas!` });
      setIsImportDialogOpen(false);
      setImportUrls('');
      setImportEventId('');
      loadPhotos();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('fotofacil_photos')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({ title: 'Erro ao excluir foto', variant: 'destructive' });
    } else {
      toast({ title: 'Foto excluída!' });
      loadPhotos();
    }
    setDeleteId(null);
  };

  const toggleActive = async (photo: Photo) => {
    const { error } = await supabase
      .from('fotofacil_photos')
      .update({ is_active: !photo.is_active, updated_at: new Date().toISOString() })
      .eq('id', photo.id);

    if (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    } else {
      loadPhotos();
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // GCS Upload handler
  const handleGCSUpload = useCallback(async (files: File[]) => {
    if (selectedEventId === 'all') {
      toast({ title: 'Selecione um evento primeiro', variant: 'destructive' });
      return;
    }

    if (files.length === 0) return;

    setUploading(true);
    setUploadResults([]);
    setUploadProgress({ completed: 0, total: files.length, currentFile: '' });

    try {
      const results = await uploadMultipleToGCS(
        files,
        'fotofacil',
        selectedEventId,
        (completed, total, currentFile) => {
          setUploadProgress({ completed, total, currentFile });
        }
      );

      setUploadResults(results);

      // Save successful uploads to database
      const successfulUploads = results.filter(r => r.success);
      
      for (const result of successfulUploads) {
        const maxOrder = photos.length > 0 
          ? Math.max(...photos.map(p => p.display_order || 0)) 
          : 0;

        await supabase
          .from('fotofacil_photos')
          .insert({
            event_id: selectedEventId,
            title: result.fileName?.replace(/\.[^/.]+$/, '') || 'Foto',
            url: result.originalUrl,
            thumb_url: result.watermarkedUrl,
            display_order: maxOrder + 1,
            is_active: true,
          });
      }

      const successCount = successfulUploads.length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast({ title: `${successCount} foto(s) enviada(s) com sucesso!` });
        loadPhotos();
      }
      if (failCount > 0) {
        toast({ title: `${failCount} foto(s) falharam no upload`, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Erro no upload das fotos', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }, [selectedEventId, photos, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
    },
    onDrop: handleGCSUpload,
    disabled: uploading || selectedEventId === 'all',
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Fotos FOTOFÁCIL</h2>
          <p className="text-muted-foreground text-sm">Upload para Google Cloud Storage com marca d'água automática</p>
        </div>
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Google Cloud Storage</span>
        </div>
      </div>

      {/* Event Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-[250px] rounded-lg">
            <SelectValue placeholder="Filtrar por evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os eventos</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} className="rounded-lg">
          <LinkIcon className="h-4 w-4 mr-2" />
          Importar URLs
        </Button>
        <Button onClick={openCreateDialog} className="rounded-lg">
          <Plus className="h-4 w-4 mr-2" />
          Nova Foto
        </Button>
      </div>

      {/* GCS Upload Zone */}
      {selectedEventId && selectedEventId !== 'all' && (
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Fotos para Google Cloud Storage
            </CardTitle>
            <CardDescription>
              Arraste fotos ou clique para selecionar. As fotos serão enviadas para o GCS com marca d'água automática.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-300 hover:border-gray-400'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <div className="space-y-3">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-emerald-600" />
                  <div>
                    <p className="font-medium">Enviando fotos para GCS...</p>
                    <p className="text-sm text-muted-foreground">
                      {uploadProgress.completed} de {uploadProgress.total} - {uploadProgress.currentFile}
                    </p>
                  </div>
                  <Progress value={(uploadProgress.completed / uploadProgress.total) * 100} className="h-2" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Cloud className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="font-medium">
                    {isDragActive ? 'Solte as fotos aqui' : 'Arraste fotos ou clique para selecionar'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Suporta JPG, PNG, WebP, GIF e vídeos MP4, MOV
                  </p>
                </div>
              )}
            </div>

            {/* Upload Results */}
            {uploadResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="font-medium text-sm">Resultados do upload:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uploadResults.map((result, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                        result.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {result.success ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span className="truncate">{result.fileName || `Arquivo ${index + 1}`}</span>
                      {!result.success && <span className="text-xs">- {result.error}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Photos Grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className={`group relative rounded-lg overflow-hidden border ${!photo.is_active ? 'opacity-50' : ''}`}
          >
            <img 
              src={photo.thumb_url || photo.url} 
              alt={photo.title || 'Foto'} 
              className="w-full aspect-square object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-1">
                <Button variant="secondary" size="icon" onClick={() => openEditDialog(photo)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => setDeleteId(photo.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <Switch
                checked={photo.is_active ?? true}
                onCheckedChange={() => toggleActive(photo)}
              />
            </div>
            {photo.price_cents && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                {formatPrice(photo.price_cents)}
              </div>
            )}
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma foto encontrada. Use "Importar URLs" ou "Nova Foto" para adicionar.
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPhoto ? 'Editar Foto' : 'Nova Foto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Evento</Label>
              <Select
                value={formData.event_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, event_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um evento" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL da Foto (alta resolução)</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>URL da Miniatura (opcional)</Label>
              <Input
                value={formData.thumb_url}
                onChange={(e) => setFormData(prev => ({ ...prev, thumb_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Título (opcional)</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Foto 001"
              />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da foto..."
              />
            </div>
            <div>
              <Label>Preço Específico (R$) - deixe 0 para usar preço do evento</Label>
              <Input
                type="number"
                step="0.01"
                value={(formData.price_cents / 100).toFixed(2)}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  price_cents: Math.round(parseFloat(e.target.value || '0') * 100) 
                }))}
                placeholder="0.00"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Foto ativa</Label>
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

      {/* Import URLs Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Fotos por URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Evento</Label>
              <Select value={importEventId} onValueChange={setImportEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um evento" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URLs (uma por linha)</Label>
              <Textarea
                value={importUrls}
                onChange={(e) => setImportUrls(e.target.value)}
                placeholder="https://exemplo.com/foto1.jpg&#10;https://exemplo.com/foto2.jpg&#10;https://exemplo.com/foto3.jpg"
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
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
