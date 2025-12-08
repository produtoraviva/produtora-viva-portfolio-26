import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Search, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FotoFacilFooter from '@/components/fotofacil/FotoFacilFooter';

interface OrderResult {
  id: string;
  status: string;
  total_cents: number;
  created_at: string;
  delivery_token: string;
  delivery_expires_at: string;
  items_count: number;
}

const FotoFacilMyPhotos = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'cpf' | 'email'>('cpf');
  const [searchValue, setSearchValue] = useState('');
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [searched, setSearched] = useState(false);

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Por favor, informe o CPF ou e-mail');
      return;
    }

    setLoading(true);
    setSearched(false);

    try {
      const { data, error } = await supabase.functions.invoke('fotofacil-lookup-orders', {
        body: {
          type: searchType,
          value: searchType === 'cpf' ? searchValue.replace(/\D/g, '') : searchValue.trim().toLowerCase()
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        setOrders([]);
        setSearched(true);
        return;
      }

      setOrders(data.orders || []);
      setSearched(true);
      
      if (data.orders?.length === 0) {
        toast.info('Nenhum pedido encontrado');
      }

    } catch (error: any) {
      console.error('Error searching orders:', error);
      toast.error('Erro ao buscar pedidos. Tente novamente.');
      setOrders([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAccessPhotos = (order: OrderResult) => {
    navigate(`/fotofacil/entrega/${order.id}/${order.delivery_token}`);
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/fotofacil" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Baixar Minhas Fotos</h1>
              <p className="text-sm text-gray-500">Acesse suas fotos compradas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesse suas fotos</h2>
              <p className="text-gray-600">
                Digite o CPF ou e-mail utilizado na compra para acessar suas fotos
              </p>
            </div>

            {/* Search Type Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setSearchType('cpf')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  searchType === 'cpf'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                CPF
              </button>
              <button
                onClick={() => setSearchType('email')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  searchType === 'email'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                E-mail
              </button>
            </div>

            {/* Search Input */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="search" className="text-gray-700">
                  {searchType === 'cpf' ? 'CPF' : 'E-mail'}
                </Label>
                <Input
                  id="search"
                  type={searchType === 'email' ? 'email' : 'text'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(
                    searchType === 'cpf' ? formatCPF(e.target.value) : e.target.value
                  )}
                  placeholder={searchType === 'cpf' ? '000.000.000-00' : 'seu@email.com'}
                  className="mt-1 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <Button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Pedidos
                  </>
                )}
              </Button>
            </div>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Seus dados estão protegidos</span>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-gray-500">Buscando seus pedidos...</p>
            </div>
          ) : searched && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-gray-600">
                    Verifique se o {searchType === 'cpf' ? 'CPF' : 'e-mail'} está correto
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {orders.length} pedido{orders.length > 1 ? 's' : ''} encontrado{orders.length > 1 ? 's' : ''}
                  </h3>
                  
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Pedido #{order.id.slice(0, 8)}
                          </p>
                          <p className="font-semibold text-gray-900 mt-1">
                            {formatPrice(order.total_cents)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {order.items_count} foto{order.items_count > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          {order.status === 'paid' ? (
                            isExpired(order.delivery_expires_at) ? (
                              <span className="text-sm text-red-600 font-medium">Link expirado</span>
                            ) : (
                              <Button
                                onClick={() => handleAccessPhotos(order)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Baixar
                              </Button>
                            )
                          ) : (
                            <span className="text-sm text-amber-600 font-medium">
                              Pagamento pendente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <FotoFacilFooter />
    </div>
  );
};

export default FotoFacilMyPhotos;