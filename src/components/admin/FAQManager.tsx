import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, HelpCircle, Eye, EyeOff, RefreshCw, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SortableRowProps {
  faq: FAQItem;
  onEdit: (faq: FAQItem) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

function SortableRow({ faq, onEdit, onDelete, onToggleActive }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-8">
        <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium max-w-md">
        <div className="truncate" title={faq.question}>
          {faq.question}
        </div>
      </TableCell>
      <TableCell className="max-w-lg">
        <div className="truncate text-muted-foreground" title={faq.answer}>
          {faq.answer}
        </div>
      </TableCell>
      <TableCell className="text-center">
        {faq.display_order}
      </TableCell>
      <TableCell>
        <Badge variant={faq.is_active ? "default" : "secondary"}>
          {faq.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(faq.id, !faq.is_active)}
            title={faq.is_active ? 'Desativar' : 'Ativar'}
          >
            {faq.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(faq)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" title="Excluir">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(faq.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function FAQManager() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    is_active: true
  });
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadFAQItems();
  }, []);

  const loadFAQItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFaqItems(data || []);
    } catch (error) {
      console.error('Error loading FAQ items:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar perguntas frequentes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createFAQ = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({
        title: 'Erro',
        description: 'Pergunta e resposta são obrigatórias.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const maxOrder = Math.max(...faqItems.map(f => f.display_order), 0);
      
      const { error } = await supabase
        .from('faq_items')
        .insert({
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          is_active: formData.is_active,
          display_order: maxOrder + 1
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Pergunta criada com sucesso!',
      });

      setFormData({ question: '', answer: '', is_active: true });
      setShowCreateDialog(false);
      loadFAQItems();
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar pergunta.',
        variant: 'destructive',
      });
    }
  };

  const updateFAQ = async () => {
    if (!editingFaq || !formData.question.trim() || !formData.answer.trim()) {
      toast({
        title: 'Erro',
        description: 'Pergunta e resposta são obrigatórias.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('faq_items')
        .update({
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          is_active: formData.is_active
        })
        .eq('id', editingFaq.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Pergunta atualizada com sucesso!',
      });

      setEditingFaq(null);
      setFormData({ question: '', answer: '', is_active: true });
      loadFAQItems();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar pergunta.',
        variant: 'destructive',
      });
    }
  };

  const deleteFAQ = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faq_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Pergunta excluída com sucesso!',
      });

      loadFAQItems();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir pergunta.',
        variant: 'destructive',
      });
    }
  };

  const toggleFAQActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('faq_items')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Pergunta ${isActive ? 'ativada' : 'desativada'} com sucesso!`,
      });

      loadFAQItems();
    } catch (error) {
      console.error('Error toggling FAQ status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status da pergunta.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      is_active: faq.is_active
    });
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = faqItems.findIndex(item => item.id === active.id);
      const newIndex = faqItems.findIndex(item => item.id === over.id);

      const newFaqItems = arrayMove(faqItems, oldIndex, newIndex);
      setFaqItems(newFaqItems);

      // Update display_order in database
      try {
        const updates = newFaqItems.map((item, index) => ({
          id: item.id,
          display_order: index + 1
        }));

        for (const update of updates) {
          await supabase
            .from('faq_items')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        toast({
          title: 'Sucesso',
          description: 'Ordem das perguntas atualizada!',
        });
      } catch (error) {
        console.error('Error updating FAQ order:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar ordem das perguntas.',
          variant: 'destructive',
        });
        loadFAQItems(); // Reload on error
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Gerenciar FAQ
          </h2>
          <p className="text-muted-foreground">
            Gerencie as perguntas frequentes do site
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadFAQItems}
            title="Atualizar lista"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nova Pergunta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Pergunta</DialogTitle>
                <DialogDescription>
                  Adicione uma nova pergunta frequente ao site
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Pergunta *</Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    placeholder="Digite a pergunta"
                  />
                </div>
                <div>
                  <Label htmlFor="answer">Resposta *</Label>
                  <Textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => setFormData({...formData, answer: e.target.value})}
                    placeholder="Digite a resposta"
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_active">Ativo (visível no site)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={createFAQ}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingFaq} onOpenChange={() => setEditingFaq(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Pergunta</DialogTitle>
            <DialogDescription>
              Edite a pergunta frequente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-question">Pergunta *</Label>
              <Input
                id="edit-question"
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                placeholder="Digite a pergunta"
              />
            </div>
            <div>
              <Label htmlFor="edit-answer">Resposta *</Label>
              <Textarea
                id="edit-answer"
                value={formData.answer}
                onChange={(e) => setFormData({...formData, answer: e.target.value})}
                placeholder="Digite a resposta"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit_is_active">Ativo (visível no site)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFaq(null)}>
              Cancelar
            </Button>
            <Button onClick={updateFAQ}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Perguntas</p>
                <p className="text-2xl font-bold">{faqItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Eye className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Perguntas Ativas</p>
                <p className="text-2xl font-bold">{faqItems.filter(f => f.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <EyeOff className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Perguntas Inativas</p>
                <p className="text-2xl font-bold">{faqItems.filter(f => !f.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Perguntas Frequentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : faqItems.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma pergunta cadastrada</p>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Pergunta</TableHead>
                      <TableHead>Resposta</TableHead>
                      <TableHead className="text-center">Ordem</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SortableContext 
                      items={faqItems.map(f => f.id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      {faqItems.map((faq) => (
                        <SortableRow
                          key={faq.id}
                          faq={faq}
                          onEdit={handleEdit}
                          onDelete={deleteFAQ}
                          onToggleActive={toggleFAQActive}
                        />
                      ))}
                    </SortableContext>
                  </TableBody>
                </Table>
              </div>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}