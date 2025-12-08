import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, CreditCard, Shield, Lock, Tag, X, Check, Copy, Clock, QrCode, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFotoFacilCart } from '@/contexts/FotoFacilCartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FotoFacilFooter from '@/components/fotofacil/FotoFacilFooter';

// Mercado Pago Logo component
const MercadoPagoLogo = () => (
  <div className="flex items-center gap-2 text-gray-500">
    <span className="text-xs">Pagamento processado por</span>
    <div className="flex items-center gap-1 bg-[#009EE3] text-white px-2 py-0.5 rounded text-xs font-bold">
      <span>Mercado</span>
      <span className="text-[#FFE600]">Pago</span>
    </div>
  </div>
);

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
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    orderId: string;
    qrCode: string;
    qrCodeBase64: string;
    pixCopiaCola: string;
  } | null>(null);
  const paymentCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Calculate discount
  const discountCents = appliedCoupon 
    ? appliedCoupon.discountType === 'percentage'
      ? Math.round(totalCents * (appliedCoupon.discountValue / 100))
      : appliedCoupon.discountValue
    : 0;
  const finalTotalCents = Math.max(0, totalCents - discountCents);

  // Group items by event
  const groupedItems = items.reduce((acc, item) => {
    const key = item.eventId;
    if (!acc[key]) {
      acc[key] = {
        eventTitle: item.eventTitle,
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {} as Record<string, { eventTitle: string; items: typeof items }>);

  useEffect(() => {
    return () => {
      if (paymentCheckInterval.current) {
        clearInterval(paymentCheckInterval.current);
      }
    };
  }, []);

  // Auto-approve if total is 0
  useEffect(() => {
    if (step === 'payment' && paymentData && finalTotalCents === 0) {
      // Auto-approve free orders
      handleFreeOrder();
    }
  }, [step, paymentData, finalTotalCents]);

  const handleFreeOrder = async () => {
    if (!paymentData) return;
    
    try {
      // Call check-payment which should auto-approve free orders
      const { data, error } = await supabase.functions.invoke('fotofacil-check-payment', {
        body: { orderId: paymentData.orderId }
      });

      if (error) throw error;

      if (data.status === 'paid') {
        clearCart();
        navigate(`/fotofacil/entrega/${paymentData.orderId}/${data.deliveryToken}`);
      }
    } catch (error) {
      console.error('Error handling free order:', error);
    }
  };

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from('fotofacil_coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast.error('Cupom inválido ou expirado');
        return;
      }

      // Check validity dates
      const now = new Date();
      if (data.valid_from && new Date(data.valid_from) > now) {
        toast.error('Cupom ainda não está ativo');
        return;
      }
      if (data.valid_until && new Date(data.valid_until) < now) {
        toast.error('Cupom expirado');
        return;
      }

      // Check min order
      if (data.min_order_cents && totalCents < data.min_order_cents) {
        toast.error(`Pedido mínimo: ${formatPrice(data.min_order_cents)}`);
        return;
      }

      // Check min photos
      if (data.min_photos && items.length < data.min_photos) {
        toast.error(`Mínimo de ${data.min_photos} foto${data.min_photos > 1 ? 's' : ''} para usar este cupom`);
        return;
      }

      // Check max uses
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast.error('Cupom esgotado');
        return;
      }

      setAppliedCoupon({
        id: data.id,
        code: data.code,
        discountType: data.discount_type,
        discountValue: data.discount_value
      });
      toast.success('Cupom aplicado!');
      setCouponCode('');
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Erro ao aplicar cupom');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }
    setStep('checkout');
  };

  const startPaymentCheck = (orderId: string) => {
    paymentCheckInterval.current = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fotofacil-check-payment', {
          body: { orderId }
        });

        if (error) throw error;

        if (data.status === 'paid') {
          clearInterval(paymentCheckInterval.current!);
          clearCart();
          navigate(`/fotofacil/entrega/${orderId}/${data.deliveryToken}`);
        }
      } catch (error) {
        console.error('Error checking payment:', error);
      }
    }, 5000);
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
          })),
          couponId: appliedCoupon?.id || null
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
      
      // Start checking for payment (only if not free)
      if (finalTotalCents > 0) {
        startPaymentCheck(data.orderId);
      }

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

  // Payment Screen
  if (step === 'payment' && paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-3">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h1 className="text-base md:text-xl font-bold tracking-tight text-gray-900">Pagamento PIX</h1>
              </div>
              <Link to="/fotofacil" className="text-base md:text-xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                FOTOFÁCIL
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-lg mx-auto px-4 py-6 md:py-8 w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-emerald-100 rounded-full mb-4">
                <QrCode className="w-7 h-7 md:w-8 md:h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Pedido Criado</h2>
              <p className="text-gray-600 text-sm md:text-base">
                {finalTotalCents === 0 ? 'Processando seu pedido gratuito...' : 'Escaneie o QR Code ou copie o código PIX'}
              </p>
            </div>

            {/* Order Info */}
            <div className="bg-emerald-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-emerald-700">Valor total</span>
                <span className="text-xl md:text-2xl font-bold text-emerald-600">{formatPrice(finalTotalCents)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-emerald-600">
                <span>{items.length} foto{items.length > 1 ? 's' : ''}</span>
                <span>Pedido #{paymentData.orderId.slice(0, 8)}</span>
              </div>
            </div>

            {finalTotalCents > 0 && (
              <>
                {paymentData.qrCodeBase64 && (
                  <div className="flex justify-center mb-6">
                    <div className="bg-white p-3 md:p-4 rounded-xl border-2 border-gray-200">
                      <img 
                        src={`data:image/png;base64,${paymentData.qrCodeBase64}`} 
                        alt="QR Code PIX"
                        className="w-40 h-40 md:w-48 md:h-48"
                      />
                    </div>
                  </div>
                )}

                {paymentData.pixCopiaCola && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-700 mb-2 font-bold">PIX Copia e Cola:</p>
                    <div className="flex gap-2">
                      <Input 
                        value={paymentData.pixCopiaCola} 
                        readOnly 
                        className="font-mono text-xs bg-gray-50 text-gray-800 border-gray-300 rounded-xl"
                      />
                      <Button 
                        onClick={() => copyToClipboard(paymentData.pixCopiaCola)} 
                        variant="outline"
                        className="shrink-0 rounded-full border-gray-300"
                      >
                        <Copy className="w-4 h-4 text-gray-700" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl mb-6">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Aguardando pagamento...</p>
                    <p className="text-xs text-blue-700">Você será redirecionado automaticamente após a confirmação</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl mb-4">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                Suas fotos estarão disponíveis para download imediatamente após a confirmação do pagamento.
              </p>
            </div>

            {/* Mercado Pago Badge */}
            <div className="flex justify-center">
              <MercadoPagoLogo />
            </div>
          </div>

          <div className="text-center">
            <Link to="/fotofacil">
              <Button variant="ghost" className="text-gray-600 rounded-full">
                Continuar Navegando
              </Button>
            </Link>
          </div>
        </main>

        <FotoFacilFooter />
      </div>
    );
  }

  // Checkout Screen
  if (step === 'checkout') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-4">
                <button onClick={() => setStep('cart')} className="text-gray-500 hover:text-gray-900 transition-colors rounded-full p-1">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <ShoppingCart className="w-5 h-5 text-emerald-600 hidden sm:block" />
                <h1 className="text-base md:text-xl font-bold tracking-tight text-gray-900">Finalizar Compra</h1>
              </div>
              <Link to="/fotofacil" className="text-base md:text-xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                FOTOFÁCIL
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto px-4 py-6 md:py-8 w-full">
          <div className="grid lg:grid-cols-5 gap-6 md:gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Seus Dados</h2>
                
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="name" className="text-gray-700">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                      className="mt-1.5 bg-white border-gray-200 focus:border-gray-400 text-gray-900 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className="mt-1.5 bg-white border-gray-200 focus:border-gray-400 text-gray-900 rounded-xl"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Use este e-mail para baixar suas fotos posteriormente
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="cpf" className="text-gray-700">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                      placeholder="000.000.000-00"
                      className="mt-1.5 bg-white border-gray-200 focus:border-gray-400 text-gray-900 rounded-xl"
                    />
                  </div>
                </div>

                {/* Security Badges */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span className="text-xs">Compra Segura</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      <span className="text-xs">Dados Criptografados</span>
                    </div>
                  </div>
                  <div className="flex justify-center mt-4">
                    <MercadoPagoLogo />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
                
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.photoId} className="flex items-center gap-3">
                      <img 
                        src={item.thumbUrl}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.eventTitle}</p>
                        <p className="text-sm text-gray-500">{formatPrice(item.priceCents)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({items.length} foto{items.length > 1 ? 's' : ''})</span>
                    <span className="text-gray-900">{formatPrice(totalCents)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Desconto ({appliedCoupon.code})</span>
                      <span>-{formatPrice(discountCents)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                    <span className="text-gray-900">Total</span>
                    <span className="text-emerald-600">{formatPrice(finalTotalCents)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment} 
                  disabled={loading}
                  className="w-full mt-6 bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5 mr-2" />
                      {finalTotalCents === 0 ? 'Finalizar Pedido' : 'Pagar com PIX'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>

        <FotoFacilFooter />
      </div>
    );
  }

  // Cart Screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4">
              <Link to="/fotofacil" className="text-gray-500 hover:text-gray-900 transition-colors rounded-full p-1">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <ShoppingCart className="w-5 h-5 text-emerald-600 hidden sm:block" />
              <h1 className="text-base md:text-xl font-bold tracking-tight text-gray-900">Carrinho</h1>
            </div>
            <Link to="/fotofacil" className="text-base md:text-xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              FOTOFÁCIL
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 md:py-8 w-full">
        {items.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full mb-6">
              <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-6">Adicione algumas fotos para continuar</p>
            <Link to="/fotofacil">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full">Ver Fotos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Products - Grouped by Event */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    {items.length} foto{items.length > 1 ? 's' : ''} selecionada{items.length > 1 ? 's' : ''}
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    Limpar tudo
                  </button>
                </div>

                <div className="space-y-6">
                  {Object.entries(groupedItems).map(([eventId, group]) => (
                    <div key={eventId}>
                      {/* Event Header */}
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-gray-800 text-sm md:text-base">{group.eventTitle}</span>
                        <span className="text-xs md:text-sm text-gray-400">({group.items.length} foto{group.items.length > 1 ? 's' : ''})</span>
                      </div>
                      
                      {/* Event Items */}
                      <div className="space-y-3">
                        {group.items.map(item => (
                          <div 
                            key={item.photoId}
                            className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl"
                          >
                            <img 
                              src={item.thumbUrl}
                              alt={item.title}
                              className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate text-sm md:text-base">{item.title}</p>
                              <p className="text-xs text-gray-400">ID: {item.photoId.slice(0, 8)}</p>
                              <p className="text-base md:text-lg font-bold text-emerald-600">{formatPrice(item.priceCents)}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.photoId)}
                              className="text-gray-400 hover:text-red-500 p-2 transition-colors rounded-full"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Resumo</h2>

                {/* Coupon */}
                <div className="mb-6">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">{appliedCoupon.code}</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-emerald-600 hover:text-emerald-800">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Código do cupom"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="bg-white border-gray-200 text-gray-900 rounded-l-full rounded-r-none border-r-0"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="shrink-0 rounded-l-none rounded-r-full text-gray-700 border-gray-300"
                      >
                        {couponLoading ? '...' : 'Aplicar'}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatPrice(totalCents)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Desconto</span>
                      <span>-{formatPrice(discountCents)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-100">
                    <span className="text-gray-900">Total</span>
                    <span className="text-emerald-600">{formatPrice(finalTotalCents)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-full"
                  size="lg"
                >
                  Continuar
                </Button>

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-xs">Compra 100% Segura</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span className="text-xs">Pagamento via PIX</span>
                    </div>
                  </div>
                  <div className="flex justify-center mt-4">
                    <MercadoPagoLogo />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <FotoFacilFooter />
    </div>
  );
};

export default FotoFacilCart;