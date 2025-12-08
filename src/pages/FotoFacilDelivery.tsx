import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Download, AlertTriangle, CheckCircle, ArrowLeft, Package, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import FotoFacilFooter from '@/components/fotofacil/FotoFacilFooter';

interface OrderItem {
  id: string;
  title_snapshot: string;
  photo: {
    id: string;
    url: string;
    thumb_url: string | null;
  } | null;
}

interface Order {
  id: string;
  status: string;
  delivery_expires_at: string | null;
  delivered_at: string | null;
}

const FotoFacilDelivery = () => {
  const { orderId, token } = useParams<{ orderId: string; token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (orderId && token) {
      validateAndLoadOrder();
    }
  }, [orderId, token]);

  const validateAndLoadOrder = async () => {
    try {
      setLoading(true);
      
      const { data, error: fnError } = await supabase.functions.invoke('fotofacil-validate-delivery', {
        body: { orderId, token }
      });

      if (fnError) throw fnError;

      if (data.error) {
        setError(data.error);
        return;
      }

      setOrder(data.order);
      setItems(data.items || []);

    } catch (err: any) {
      console.error('Error validating delivery:', err);
      setError('Erro ao carregar pedido. Por favor, entre em contato com o suporte.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, title: string, id: string) => {
    try {
      setDownloading(id);
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${title}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      toast.success('Download iniciado!');
    } catch (err) {
      console.error('Error downloading:', err);
      toast.error('Erro ao baixar arquivo');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    toast.info(`Baixando ${items.length} fotos...`);
    for (const item of items) {
      if (item.photo?.url) {
        await handleDownload(item.photo.url, item.title_snapshot || 'foto', item.id);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    toast.success('Todos os downloads concluídos!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando acesso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Link Expirado ou Inválido</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-sm text-gray-500 mb-8">
              Se você acredita que isso é um erro, entre em contato com nosso suporte informando o número do seu pedido.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/fotofacil/minhas-fotos">
                <Button variant="outline" className="rounded-xl">
                  Buscar minhas fotos
                </Button>
              </Link>
              <Link to="/fotofacil">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <FotoFacilFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Warning Banner */}
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 text-sm">Salve suas fotos agora!</p>
              <p className="text-xs text-amber-700">
                Este link expira em 24 horas e não poderá ser acessado novamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Suas Fotos</h1>
              <p className="text-sm text-gray-500">Pedido #{orderId?.slice(0, 8)}</p>
            </div>
            {items.length > 1 && (
              <Button onClick={handleDownloadAll} className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Baixar Todas</span>
                <span className="sm:hidden">Todas</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-emerald-800">Pagamento Confirmado!</p>
              <p className="text-sm text-emerald-700">
                {items.length === 1 
                  ? 'Sua foto está pronta para download.'
                  : `Suas ${items.length} fotos estão prontas para download.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {item.photo?.thumb_url || item.photo?.url ? (
                  <img 
                    src={item.photo.thumb_url || item.photo.url}
                    alt={item.title_snapshot}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium text-gray-900 mb-3 truncate">{item.title_snapshot || 'Foto'}</p>
                {item.photo?.url && (
                  <Button 
                    onClick={() => handleDownload(item.photo!.url, item.title_snapshot || 'foto', item.id)}
                    disabled={downloading === item.id}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                  >
                    {downloading === item.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                        Baixando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Foto
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-md mx-auto">
            <p className="text-gray-600 text-sm mb-4">
              Dúvidas sobre seu pedido? Entre em contato com nosso suporte.
            </p>
            <Link to="/fotofacil">
              <Button variant="outline" className="rounded-xl text-gray-700 border-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para FOTOFÁCIL
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <FotoFacilFooter />
    </div>
  );
};

export default FotoFacilDelivery;
