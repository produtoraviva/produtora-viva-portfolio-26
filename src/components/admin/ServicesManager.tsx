import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Star, Users, Heart, Camera, Briefcase, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  features: string[];
  price: string;
  icon: string;
  is_highlighted: boolean;
  is_active: boolean;
  display_order: number;
}

const iconOptions = [
  { value: 'Camera', label: 'Câmera', icon: Camera },
  { value: 'Users', label: 'Usuários', icon: Users },
  { value: 'Heart', label: 'Coração', icon: Heart },
  { value: 'Briefcase', label: 'Maleta', icon: Briefcase },
  { value: 'Star', label: 'Estrela', icon: Star },
];

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    features: [''],
    price: '',
    icon: 'Camera',
    is_highlighted: false,
    is_active: true,
    display_order: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar serviços",
        description: "Não foi possível carregar os serviços.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData = {
      ...formData,
      features: formData.features.filter(f => f.trim() !== '')
    };

    try {
      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        
        toast({
          title: "Serviço atualizado",
          description: "O serviço foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('services')
          .insert(serviceData);

        if (error) throw error;
        
        toast({
          title: "Serviço criado",
          description: "O serviço foi criado com sucesso.",
        });
      }

      setDialogOpen(false);
      resetForm();
      loadServices();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o serviço.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Serviço removido",
        description: "O serviço foi removido com sucesso.",
      });
      
      loadServices();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o serviço.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      subtitle: service.subtitle || '',
      description: service.description,
      features: service.features.length > 0 ? service.features : [''],
      price: service.price,
      icon: service.icon,
      is_highlighted: service.is_highlighted,
      is_active: service.is_active,
      display_order: service.display_order
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      features: [''],
      price: '',
      icon: 'Camera',
      is_highlighted: false,
      is_active: true,
      display_order: services.length
    });
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const moveService = async (id: string, direction: 'up' | 'down') => {
    const service = services.find(s => s.id === id);
    if (!service) return;

    const otherService = services.find(s => 
      direction === 'up' 
        ? s.display_order === service.display_order - 1
        : s.display_order === service.display_order + 1
    );

    if (!otherService) return;

    try {
      await supabase.from('services').update({ display_order: otherService.display_order }).eq('id', service.id);
      await supabase.from('services').update({ display_order: service.display_order }).eq('id', otherService.id);
      
      loadServices();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível reordenar os serviços.",
        variant: "destructive",
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : Camera;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Serviços</h2>
          <p className="text-muted-foreground">Configure os serviços exibidos no site</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Serviço
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do serviço
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Características</Label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Digite uma característica"
                    />
                    {formData.features.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Característica
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Ex: A partir de R$ 500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="icon">Ícone</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="highlighted"
                    checked={formData.is_highlighted}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_highlighted: checked }))}
                  />
                  <Label htmlFor="highlighted">Destacar serviço</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="active">Ativo</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingService ? 'Atualizar' : 'Criar'} Serviço
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const IconComponent = getIconComponent(service.icon);
          return (
            <Card key={service.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      {service.subtitle && (
                        <CardDescription>{service.subtitle}</CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {service.is_highlighted && (
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                    {!service.is_active && (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
                
                <div className="space-y-1">
                  {service.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center">
                      <div className="h-1 w-1 bg-primary rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                  {service.features.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{service.features.length - 3} mais características
                    </div>
                  )}
                </div>
                
                <div className="text-sm font-medium text-primary">
                  {service.price}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between items-center">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveService(service.id, 'up')}
                    disabled={service.display_order === 0}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveService(service.id, 'down')}
                    disabled={service.display_order === services.length - 1}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o serviço "{service.title}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(service.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {services.length === 0 && (
        <Card className="p-8 text-center">
          <CardContent>
            <div className="text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum serviço encontrado</h3>
              <p>Adicione seu primeiro serviço para começar.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}