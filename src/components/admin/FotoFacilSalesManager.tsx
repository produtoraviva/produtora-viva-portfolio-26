import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  DialogHeader,
  DialogTitle,
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
import { RefreshCw, Eye, DollarSign, ShoppingCart, Users, TrendingUp, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderItem {
  id: string;
  title_snapshot: string | null;
  price_cents_snapshot: number | null;
  fotofacil_photos?: {
    url: string;
    thumb_url: string | null;
  } | null;
}

interface Order {
  id: string;
  customer_id: string | null;
  total_cents: number;
  currency: string;
  status: string;
  mercadopago_order_id: string | null;
  mercadopago_payment_id: string | null;
  delivery_token: string | null;
  delivery_expires_at: string | null;
  delivered_at: string | null;
  created_at: string;
  fotofacil_customers?: {
    name: string;
    email: string;
  } | null;
}

export function FotoFacilSalesManager() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    paidOrders: 0,
    uniqueCustomers: 0,
  });

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [statusFilter]);

  const loadOrders = async () => {
    setIsLoading(true);
    
    let query = supabase
      .from('fotofacil_orders')
      .select('*, fotofacil_customers(name, email)')
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: 'Erro ao carregar pedidos', variant: 'destructive' });
    } else {
      let filteredData = data || [];
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(order => 
          order.id.toLowerCase().includes(term) ||
          order.mercadopago_order_id?.toLowerCase().includes(term) ||
          order.fotofacil_customers?.name?.toLowerCase().includes(term) ||
          order.fotofacil_customers?.email?.toLowerCase().includes(term)
        );
      }
      
      setOrders(filteredData);
    }
    setIsLoading(false);
  };

  const loadStats = async () => {
    const { data: ordersData } = await supabase
      .from('fotofacil_orders')
      .select('total_cents, status, customer_id');

    if (ordersData) {
      const paidOrders = ordersData.filter(o => o.status === 'paid');
      const uniqueCustomers = new Set(ordersData.map(o => o.customer_id).filter(Boolean));
      
      setStats({
        totalOrders: ordersData.length,
        paidOrders: paidOrders.length,
        totalSales: paidOrders.reduce((sum, o) => sum + o.total_cents, 0),
        uniqueCustomers: uniqueCustomers.size,
      });
    }
  };

  const loadOrderItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from('fotofacil_order_items')
      .select('*, fotofacil_photos(url, thumb_url)')
      .eq('order_id', orderId);

    if (!error) {
      setOrderItems(data || []);
    }
  };

  const openOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    await loadOrderItems(order.id);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    setIsDeleting(true);
    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from('fotofacil_order_items')
        .delete()
        .eq('order_id', orderToDelete.id);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error: orderError } = await supabase
        .from('fotofacil_orders')
        .delete()
        .eq('id', orderToDelete.id);

      if (orderError) throw orderError;

      toast({ title: 'Pedido excluído com sucesso' });
      setOrderToDelete(null);
      loadOrders();
      loadStats();
    } catch (error: any) {
      toast({ 
        title: 'Erro ao excluir pedido', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const canDeleteOrder = (order: Order) => {
    // Only allow deletion of pending/created orders (not paid)
    return ['created', 'pending', 'failed'].includes(order.status);
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500 text-white">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pendente</Badge>;
      case 'created':
        return <Badge className="bg-gray-500 text-white">Criado</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendas FOTOFÁCIL</h2>
          <p className="text-gray-500 text-sm">Acompanhe todos os pedidos e pagamentos</p>
        </div>
        <Button variant="outline" onClick={() => { loadOrders(); loadStats(); }} className="border-gray-300 text-gray-700 hover:bg-gray-100">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Vendido</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalSales)}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Pedidos Pagos</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paidOrders}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.uniqueCustomers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por ID, cliente ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
            className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white border-gray-300 text-gray-900">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="created">Criado</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="failed">Falhou</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-gray-50">
                <TableHead className="text-gray-700">Data</TableHead>
                <TableHead className="text-gray-700">Cliente</TableHead>
                <TableHead className="text-gray-700">Valor</TableHead>
                <TableHead className="text-gray-700">Status</TableHead>
                <TableHead className="text-gray-700">Entrega</TableHead>
                <TableHead className="text-right text-gray-700">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum pedido encontrado
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="border-gray-200 hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-gray-900">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{order.fotofacil_customers?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{order.fotofacil_customers?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {formatPrice(order.total_cents)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      {order.delivered_at ? (
                        <Badge variant="outline" className="text-green-600 border-green-300">Entregue</Badge>
                      ) : order.delivery_token ? (
                        <Badge variant="outline" className="text-blue-600 border-blue-300">Link enviado</Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openOrderDetails(order)} className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canDeleteOrder(order) && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setOrderToDelete(order)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID do Pedido</p>
                  <p className="font-mono text-xs text-gray-900">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium text-gray-900">{selectedOrder.fotofacil_customers?.name}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.fotofacil_customers?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor Total</p>
                  <p className="font-bold text-lg text-gray-900">{formatPrice(selectedOrder.total_cents)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data do Pedido</p>
                  <p className="text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                </div>
                {selectedOrder.mercadopago_payment_id && (
                  <div>
                    <p className="text-sm text-gray-500">ID Mercado Pago</p>
                    <p className="font-mono text-xs text-gray-900">{selectedOrder.mercadopago_payment_id}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Itens do Pedido ({orderItems.length})</h4>
                <div className="grid grid-cols-4 gap-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <img 
                        src={item.fotofacil_photos?.thumb_url || item.fotofacil_photos?.url || ''} 
                        alt={item.title_snapshot || 'Foto'}
                        className="w-full aspect-square object-cover rounded"
                      />
                      <p className="text-xs text-center text-gray-900">
                        {formatPrice(item.price_cents_snapshot || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.delivery_token && (
                <div>
                  <p className="text-sm text-gray-500">Link de Entrega</p>
                  <p className="font-mono text-xs break-all bg-gray-100 p-2 rounded text-gray-900">
                    {window.location.origin}/fotofacil/entrega/{selectedOrder.id}/{selectedOrder.delivery_token}
                  </p>
                  {selectedOrder.delivery_expires_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Expira em: {formatDate(selectedOrder.delivery_expires_at)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Order Confirmation */}
      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Excluir Pedido?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Esta ação não pode ser desfeita. O pedido e todos os seus itens serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-100">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteOrder}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
