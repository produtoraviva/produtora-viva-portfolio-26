import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { History, Undo, Calendar, User } from 'lucide-react';

interface EditHistoryItem {
  id: string;
  portfolio_item_id: string;
  admin_user_id: string;
  action: string;
  previous_data: any;
  new_data: any;
  created_at: string;
  admin_user?: {
    full_name: string;
    email: string;
  };
  portfolio_item?: {
    title: string;
  };
}

export function EditHistory() {
  const [historyItems, setHistoryItems] = useState<EditHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEditHistory();
  }, []);

  const loadEditHistory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('portfolio_edit_history')
        .select(`
          *,
          admin_users:admin_user_id (
            full_name,
            email
          ),
          portfolio_items:portfolio_item_id (
            title
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setHistoryItems(data || []);
    } catch (error) {
      console.error('Error loading edit history:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar histórico de edições.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'create': return 'Criado';
      case 'update': return 'Atualizado';
      case 'delete': return 'Excluído';
      case 'reorder': return 'Reordenado';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-500';
      case 'update': return 'bg-blue-500';
      case 'delete': return 'bg-red-500';
      case 'reorder': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getChangeSummary = (item: EditHistoryItem) => {
    if (item.action === 'create') {
      return 'Item criado';
    }
    
    if (item.action === 'delete') {
      return 'Item excluído';
    }

    if (item.action === 'update' && item.previous_data && item.new_data) {
      const changes = [];
      const prev = item.previous_data;
      const curr = item.new_data;

      if (prev.title !== curr.title) {
        changes.push(`Título: "${prev.title}" → "${curr.title}"`);
      }
      if (prev.publish_status !== curr.publish_status) {
        changes.push(`Status: ${prev.publish_status} → ${curr.publish_status}`);
      }
      if (prev.category !== curr.category) {
        changes.push(`Categoria: ${prev.category} → ${curr.category}`);
      }
      if (prev.is_featured !== curr.is_featured) {
        changes.push(`Destaque: ${prev.is_featured ? 'Sim' : 'Não'} → ${curr.is_featured ? 'Sim' : 'Não'}`);
      }

      return changes.length > 0 ? changes.join(', ') : 'Atualizado';
    }

    return 'Modificado';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando histórico...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <History className="h-6 w-6" />
        <h2 className="text-2xl font-semibold">Histórico de Edições</h2>
      </div>

      {historyItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum histórico encontrado</h3>
            <p className="text-muted-foreground text-center">
              As edições do portfólio aparecerão aqui quando você começar a fazer alterações.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {historyItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-white ${getActionColor(item.action)}`}>
                        {getActionText(item.action)}
                      </Badge>
                      <h3 className="font-semibold">
                        {item.portfolio_item?.title || 'Item removido'}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {getChangeSummary(item)}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.admin_user?.full_name || 'Usuário removido'}
                      </div>
                    </div>
                  </div>

                  {/* Future feature: Undo functionality */}
                  {/*
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="opacity-50"
                  >
                    <Undo className="h-4 w-4 mr-2" />
                    Desfazer
                  </Button>
                  */}
                </div>
              </CardContent>
            </Card>
          ))}

          {historyItems.length >= 50 && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Mostrando os últimos 50 registros. Registros mais antigos são removidos automaticamente.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}