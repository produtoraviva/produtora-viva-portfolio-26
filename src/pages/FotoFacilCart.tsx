import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFotoFacilCart } from '@/contexts/FotoFacilCartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const FotoFacilCart = () => {
  const { items, removeItem, clearCart, totalCents } = useFotoFacilCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<'cart' | 'checkout' | 'payment'>('cart');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: ''
  });
  const [paymentData, setPaymentData] = useState<{
    orderId: string;
    qrCode: string;
    qrCodeBase64: string;
    pixCopiaCola: string;
  } | null>(null);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const validateCPF = (cpf: string): boolean => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1+$/.test(digits)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(digits[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(digits[10])) return false;

    return true;
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }
    setStep('checkout');
  };

  const handlePayment = async () => {
    if (!formData.name.trim()) {
      toast.error('Por favor, informe seu nome completo');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Por favor, informe um e-mail válido');
      return;
    }
    if (!validateCPF(formData.cpf)) {
      toast.error('Por favor, informe um CPF válido');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('fotofacil-create-order', {
        body: {
          customer: {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            cpf: formData.cpf.replace(/\D/g, '')
          },
          items: items.map(item => ({
            photo_id: item.photoId,
            title: item.title,
            price_cents: item.priceCents
          }))
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setPaymentData({
        orderId: data.orderId,
        qrCode: data.qrCode || '',
        qrCodeBase64: data.qrCodeBase64 || '',
        pixCopiaCola: data.pixCopiaCola || ''
      });
      setStep('payment');

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Código PIX copiado!');
  };

  if (step === 'payment' && paymentData) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold tracking-tight text-center">Pagamento PIX</h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Pedido Criado!</h2>
            <p className="text-gray-600">Escaneie o QR Code ou copie o código PIX</p>
            <p className="text-lg font-semibold mt-2">Total: {formatPrice(totalCents)}</p>
          </div>

          {paymentData.qrCodeBase64 && (
            <div className="flex justify-center mb-6">
              <img 
                src={`data:image/png;base64,${paymentData.qrCodeBase64}`} 
                alt="QR Code PIX"
                className="w-64 h-64 border border-gray-200 rounded-lg"
              />
            </div>
          )}

          {paymentData.pixCopiaCola && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">PIX Copia e Cola:</p>
              <div className="flex gap-2">
                <Input 
                  value={paymentData.pixCopiaCola} 
                  readOnly 
                  className="font-mono text-xs bg-white"
                />
                <Button onClick={() => copyToClipboard(paymentData.pixCopiaCola)}>
                  Copiar
                </Button>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Após o pagamento, você receberá um e-mail com o link para baixar suas fotos. 
              O link expira em 24 horas.
            </p>
          </div>

          <div className="text-center">
            <Link to="/fotofacil">
              <Button variant="outline" className="mr-4">
                Continuar Navegando
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'checkout') {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setStep('cart')} className="text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold tracking-tight">Seus Dados</h1>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Seu nome completo"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="seu@email.com"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                O link para download será enviado para este e-mail
              </p>
            </div>

            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                placeholder="000.000.000-00"
                className="mt-1"
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">{items.length} foto(s)</span>
                <span className="font-bold text-lg">{formatPrice(totalCents)}</span>
              </div>
            </div>

            <Button 
              onClick={handlePayment} 
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pagar com PIX - {formatPrice(totalCents)}
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/fotofacil" className="text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Carrinho</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-6">Adicione algumas fotos para continuar</p>
            <Link to="/fotofacil">
              <Button>Ver Fotos</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div 
                  key={item.photoId}
                  className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <img 
                    src={item.thumbUrl}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-lg font-bold text-gray-900">{formatPrice(item.priceCents)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.photoId)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg text-gray-600">Total ({items.length} foto{items.length > 1 ? 's' : ''})</span>
                <span className="text-2xl font-bold">{formatPrice(totalCents)}</span>
              </div>

              <Button 
                onClick={handleCheckout}
                className="w-full bg-gray-900 hover:bg-gray-800"
                size="lg"
              >
                Realizar Pagamento
              </Button>

              <button
                onClick={clearCart}
                className="w-full text-center text-red-500 hover:text-red-700 mt-4 text-sm"
              >
                Limpar Carrinho
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default FotoFacilCart;