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
import { RefreshCw, Eye, DollarSign, ShoppingCart, Users, TrendingUp, Search } from 'lucide-react';
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

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case 'created':
        return <Badge variant="secondary">Criado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
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
          <h2 className="text-2xl font-bold">Vendas FOTOFÁCIL</h2>
          <p className="text-muted-foreground text-sm">Acompanhe todos os pedidos e pagamentos</p>
        </div>
        <Button variant="outline" onClick={() => { loadOrders(); loadStats(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pagos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.paidOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueCustomers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, cliente ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum pedido encontrado
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.fotofacil_customers?.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{order.fotofacil_customers?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(order.total_cents)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      {order.delivered_at ? (
                        <Badge variant="outline" className="text-green-600">Entregue</Badge>
                      ) : order.delivery_token ? (
                        <Badge variant="outline" className="text-blue-600">Link enviado</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openOrderDetails(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID do Pedido</p>
                  <p className="font-mono text-xs">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedOrder.fotofacil_customers?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.fotofacil_customers?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-bold text-lg">{formatPrice(selectedOrder.total_cents)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data do Pedido</p>
                  <p>{formatDate(selectedOrder.created_at)}</p>
                </div>
                {selectedOrder.mercadopago_payment_id && (
                  <div>
                    <p className="text-sm text-muted-foreground">ID Mercado Pago</p>
                    <p className="font-mono text-xs">{selectedOrder.mercadopago_payment_id}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-3">Itens do Pedido ({orderItems.length})</h4>
                <div className="grid grid-cols-4 gap-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <img 
                        src={item.fotofacil_photos?.thumb_url || item.fotofacil_photos?.url || ''} 
                        alt={item.title_snapshot || 'Foto'}
                        className="w-full aspect-square object-cover rounded"
                      />
                      <p className="text-xs text-center">
                        {formatPrice(item.price_cents_snapshot || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.delivery_token && (
                <div>
                  <p className="text-sm text-muted-foreground">Link de Entrega</p>
                  <p className="font-mono text-xs break-all bg-muted p-2 rounded">
                    {window.location.origin}/fotofacil/entrega/{selectedOrder.id}/{selectedOrder.delivery_token}
                  </p>
                  {selectedOrder.delivery_expires_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expira em: {formatDate(selectedOrder.delivery_expires_at)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
