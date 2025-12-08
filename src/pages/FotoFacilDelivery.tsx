import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Download, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

  const handleDownload = async (url: string, title: string) => {
    try {
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
    }
  };

  const handleDownloadAll = async () => {
    toast.info('Iniciando downloads...');
    for (const item of items) {
      if (item.photo?.url) {
        await handleDownload(item.photo.url, item.title_snapshot || 'foto');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    toast.success('Todos os downloads concluídos!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando acesso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expirado ou Inválido</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            Se você acredita que isso é um erro, entre em contato com nosso suporte informando o número do seu pedido.
          </p>
          <Link to="/fotofacil">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Warning Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">ATENÇÃO: Salve suas fotos agora!</p>
              <p className="text-sm text-yellow-700">
                Este link expira em 24 horas e não poderá ser acessado novamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Suas Fotos</h1>
              <p className="text-sm text-gray-500">Pedido #{orderId?.slice(0, 8)}</p>
            </div>
            {items.length > 1 && (
              <Button onClick={handleDownloadAll} className="bg-gray-900 hover:bg-gray-800">
                <Download className="w-4 h-4 mr-2" />
                Baixar Todas
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Pagamento Confirmado!</p>
              <p className="text-sm text-green-700">
                Suas {items.length} foto{items.length > 1 ? 's estão prontas' : ' está pronta'} para download.
              </p>
            </div>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div 
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="aspect-square bg-gray-100">
                {item.photo?.thumb_url || item.photo?.url ? (
                  <img 
                    src={item.photo.thumb_url || item.photo.url}
                    alt={item.title_snapshot}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Foto não disponível
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium mb-3 truncate">{item.title_snapshot || 'Foto'}</p>
                {item.photo?.url && (
                  <Button 
                    onClick={() => handleDownload(item.photo!.url, item.title_snapshot || 'foto')}
                    className="w-full bg-gray-900 hover:bg-gray-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Dúvidas? Entre em contato com nosso suporte.</p>
        </div>
      </main>
    </div>
  );
};

export default FotoFacilDelivery;