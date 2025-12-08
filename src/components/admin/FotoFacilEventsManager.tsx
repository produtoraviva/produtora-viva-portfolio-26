import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Save, X, Calendar, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react';
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

interface Category {
  id: string;
  name: string;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  default_price_cents: number;
  currency: string;
  cover_url: string | null;
  status: string;
  is_active: boolean;
  category_id: string | null;
  fotofacil_categories?: Category | null;
  _count?: { photos: number };
}

export function FotoFacilEventsManager() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    event_date: '',
    location: '',
    default_price_cents: 0,
    cover_url: '',
    status: 'draft',
    is_active: true,
    category_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    const [eventsRes, categoriesRes] = await Promise.all([
      supabase
        .from('fotofacil_events')
        .select('*, fotofacil_categories(id, name)')
        .order('created_at', { ascending: false }),
      supabase
        .from('fotofacil_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name'),
    ]);

    if (eventsRes.error) {
      toast({ title: 'Erro ao carregar eventos', variant: 'destructive' });
    } else {
      setEvents(eventsRes.data || []);
    }

    if (!categoriesRes.error) {
      setCategories(categoriesRes.data || []);
    }
    
    setIsLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: editingEvent ? prev.slug : generateSlug(title),
    }));
  };

  const openCreateDialog = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      event_date: '',
      location: '',
      default_price_cents: 0,
      cover_url: '',
      status: 'draft',
      is_active: true,
      category_id: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      slug: event.slug,
      description: event.description || '',
      event_date: event.event_date || '',
      location: event.location || '',
      default_price_cents: event.default_price_cents,
      cover_url: event.cover_url || '',
      status: event.status,
      is_active: event.is_active ?? true,
      category_id: event.category_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast({ title: 'Título e slug são obrigatórios', variant: 'destructive' });
      return;
    }

    const eventData = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description || null,
      event_date: formData.event_date || null,
      location: formData.location || null,
      default_price_cents: formData.default_price_cents,
      cover_url: formData.cover_url || null,
      status: formData.status,
      is_active: formData.is_active,
      category_id: formData.category_id || null,
      updated_at: new Date().toISOString(),
    };

    if (editingEvent) {
      const { error } = await supabase
        .from('fotofacil_events')
        .update(eventData)
        .eq('id', editingEvent.id);

      if (error) {
        toast({ title: 'Erro ao atualizar evento', variant: 'destructive' });
      } else {
        toast({ title: 'Evento atualizado!' });
        setIsDialogOpen(false);
        loadData();
      }
    } else {
      const { error } = await supabase
        .from('fotofacil_events')
        .insert(eventData);

      if (error) {
        toast({ title: 'Erro ao criar evento', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Evento criado!' });
        setIsDialogOpen(false);
        loadData();
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('fotofacil_events')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({ title: 'Erro ao excluir evento', variant: 'destructive' });
    } else {
      toast({ title: 'Evento excluído!' });
      loadData();
    }
    setDeleteId(null);
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Publicado</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Eventos FOTOFÁCIL</h2>
          <p className="text-muted-foreground text-sm">Gerencie os eventos e seus preços</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className={!event.is_active ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  {event.fotofacil_categories && (
                    <Badge variant="outline" className="text-xs">
                      {event.fotofacil_categories.name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(event.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {event.cover_url && (
                <img 
                  src={event.cover_url} 
                  alt={event.title} 
                  className="w-full h-32 object-cover rounded"
                />
              )}
              <div className="flex items-center justify-between">
                {getStatusBadge(event.status)}
                <span className="text-sm font-medium text-primary">
                  {formatPrice(event.default_price_cents)}/foto
                </span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {event.event_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(event.event_date).toLocaleDateString('pt-BR')}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum evento criado. Clique em "Novo Evento" para começar.
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: Casamento João e Maria"
              />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="casamento-joao-maria"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do evento..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data do Evento</Label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Preço por Foto (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(formData.default_price_cents / 100).toFixed(2)}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    default_price_cents: Math.round(parseFloat(e.target.value || '0') * 100) 
                  }))}
                  placeholder="50.00"
                />
              </div>
            </div>
            <div>
              <Label>Local (opcional)</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="São Paulo, SP"
              />
            </div>
            <div>
              <Label>URL da Capa (opcional)</Label>
              <Input
                value={formData.cover_url}
                onChange={(e) => setFormData(prev => ({ ...prev, cover_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Evento ativo</Label>
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as fotos deste evento serão excluídas.
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
