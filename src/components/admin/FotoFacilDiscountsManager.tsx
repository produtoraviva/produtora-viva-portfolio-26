import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Ticket, Percent, Tag, X, Check, Sparkles, TrendingDown, ImageIcon, Calendar } from 'lucide-react';

interface EventDiscount {
  id: string;
  event_id: string;
  min_quantity: number;
  discount_percent: number;
}

interface Event {
  id: string;
  title: string;
  status: string;
  is_active: boolean;
}

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_cents: number;
  min_photos: number | null;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

export function FotoFacilDiscountsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventDiscounts, setEventDiscounts] = useState<Record<string, EventDiscount[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [newDiscount, setNewDiscount] = useState({ min_quantity: 2, discount_percent: 10 });
  
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_order_cents: 0,
    min_photos: '',
    max_uses: '',
    valid_until: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [couponsRes, eventsRes, discountsRes] = await Promise.all([
        supabase
          .from('fotofacil_coupons')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('fotofacil_events')
          .select('id, title, status, is_active')
          .eq('is_active', true)
          .order('title'),
        supabase
          .from('fotofacil_event_discounts')
          .select('*')
          .order('min_quantity')
      ]);

      if (!couponsRes.error) {
        setCoupons((couponsRes.data || []) as Coupon[]);
      }
      if (!eventsRes.error) {
        setEvents(eventsRes.data || []);
      }
      if (!discountsRes.error) {
        // Group discounts by event_id
        const grouped: Record<string, EventDiscount[]> = {};
        (discountsRes.data || []).forEach((d: EventDiscount) => {
          if (!grouped[d.event_id]) grouped[d.event_id] = [];
          grouped[d.event_id].push(d);
        });
        setEventDiscounts(grouped);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  // Coupon handlers
  const handleCreateCoupon = async () => {
    if (!couponFormData.code.trim()) {
      toast.error('Informe o código do cupom');
      return;
    }
    if (couponFormData.discount_value <= 0) {
      toast.error('Informe o valor do desconto');
      return;
    }

    try {
      const { error } = await supabase
        .from('fotofacil_coupons')
        .insert({
          code: couponFormData.code.toUpperCase().trim(),
          description: couponFormData.description.trim() || null,
          discount_type: couponFormData.discount_type,
          discount_value: couponFormData.discount_type === 'percentage' 
            ? couponFormData.discount_value 
            : couponFormData.discount_value * 100,
          min_order_cents: couponFormData.min_order_cents * 100,
          min_photos: couponFormData.min_photos ? parseInt(couponFormData.min_photos) : null,
          max_uses: couponFormData.max_uses ? parseInt(couponFormData.max_uses) : null,
          valid_until: couponFormData.valid_until || null
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Já existe um cupom com este código');
          return;
        }
        throw error;
      }
      
      toast.success('Cupom criado com sucesso');
      setCouponFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_order_cents: 0,
        min_photos: '',
        max_uses: '',
        valid_until: ''
      });
      setShowCouponForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Erro ao criar cupom');
    }
  };

  const handleToggleCouponActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('fotofacil_coupons')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: isActive } : c));
      toast.success('Cupom atualizado');
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error('Erro ao atualizar cupom');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Deseja realmente excluir este cupom?')) return;

    try {
      const { error } = await supabase
        .from('fotofacil_coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Cupom excluído');
      loadData();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Erro ao excluir cupom');
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  // Event discount handlers
  const handleAddEventDiscount = async () => {
    if (!selectedEventId) {
      toast.error('Selecione um evento');
      return;
    }
    if (newDiscount.min_quantity < 2) {
      toast.error('Quantidade mínima deve ser pelo menos 2');
      return;
    }
    if (newDiscount.discount_percent < 1 || newDiscount.discount_percent > 100) {
      toast.error('Desconto deve estar entre 1% e 100%');
      return;
    }

    try {
      const { error } = await supabase
        .from('fotofacil_event_discounts')
        .insert({
          event_id: selectedEventId,
          min_quantity: newDiscount.min_quantity,
          discount_percent: newDiscount.discount_percent
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Já existe um desconto para esta quantidade neste evento');
          return;
        }
        throw error;
      }

      toast.success('Desconto progressivo adicionado');
      setNewDiscount({ min_quantity: 2, discount_percent: 10 });
      loadData();
    } catch (error) {
      console.error('Error adding event discount:', error);
      toast.error('Erro ao adicionar desconto');
    }
  };

  const handleDeleteEventDiscount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fotofacil_event_discounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Desconto removido');
      loadData();
    } catch (error) {
      console.error('Error deleting event discount:', error);
      toast.error('Erro ao remover desconto');
    }
  };

  const activeCoupons = coupons.filter(c => c.is_active);
  const inactiveCoupons = coupons.filter(c => !c.is_active);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progressive Event Discounts Section */}
      <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-purple-600 text-white pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingDown className="w-6 h-6" />
            Descontos Progressivos por Evento
          </CardTitle>
          <CardDescription className="text-purple-100">
            Configure descontos automáticos baseados na quantidade de fotos compradas de cada evento
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Add new discount */}
          <div className="p-4 bg-purple-50 rounded-xl space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" />
              Adicionar Desconto Progressivo
            </h4>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700">Evento</Label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 rounded-xl h-11">
                    <SelectValue placeholder="Selecione um evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">A partir de (fotos)</Label>
                <Input
                  type="number"
                  min="2"
                  value={newDiscount.min_quantity}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, min_quantity: parseInt(e.target.value) || 2 }))}
                  className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Desconto (%)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={newDiscount.discount_percent}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, discount_percent: parseInt(e.target.value) || 0 }))}
                    className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                  />
                  <Button 
                    onClick={handleAddEventDiscount}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Events with discounts */}
          <div className="space-y-4">
            {events.map(event => {
              const discounts = eventDiscounts[event.id] || [];
              if (discounts.length === 0) return null;
              
              return (
                <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-gray-800">{event.title}</span>
                    <Badge variant="outline" className="text-xs">{discounts.length} desconto(s)</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {discounts.sort((a, b) => a.min_quantity - b.min_quantity).map(discount => (
                      <div 
                        key={discount.id}
                        className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-3 py-1.5"
                      >
                        <span className="text-sm text-purple-800">
                          {discount.min_quantity}+ fotos: <strong>{discount.discount_percent}% OFF</strong>
                        </span>
                        <button
                          onClick={() => handleDeleteEventDiscount(discount.id)}
                          className="text-purple-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {Object.keys(eventDiscounts).length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                <TrendingDown className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Nenhum desconto progressivo configurado</p>
                <p className="text-sm">Selecione um evento acima para começar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Coupons Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-emerald-600" />
              Cupons de Desconto
            </h2>
            <p className="text-gray-600 text-sm mt-1">Códigos promocionais para aplicar no checkout</p>
          </div>
          <Button 
            onClick={() => setShowCouponForm(!showCouponForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg"
          >
            {showCouponForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showCouponForm ? 'Cancelar' : 'Novo Cupom'}
          </Button>
        </div>

        {/* Create Coupon Form */}
        {showCouponForm && (
          <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-emerald-600 text-white pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5" />
                Criar Novo Cupom
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Código do Cupom *
                  </Label>
                  <Input
                    value={couponFormData.code}
                    onChange={(e) => setCouponFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="DESCONTO10"
                    className="uppercase bg-white border-gray-300 text-gray-900 rounded-xl h-11 font-mono text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Descrição</Label>
                  <Input
                    value={couponFormData.description}
                    onChange={(e) => setCouponFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="10% de desconto"
                    className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-gray-700">Tipo de Desconto</Label>
                  <Select 
                    value={couponFormData.discount_type}
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setCouponFormData(prev => ({ ...prev, discount_type: value }))
                    }
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Valor * {couponFormData.discount_type === 'percentage' ? '(%)' : '(R$)'}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={couponFormData.discount_value || ''}
                    onChange={(e) => setCouponFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                    className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Mínimo de Fotos</Label>
                  <Input
                    type="number"
                    min="1"
                    value={couponFormData.min_photos}
                    onChange={(e) => setCouponFormData(prev => ({ ...prev, min_photos: e.target.value }))}
                    placeholder="Sem mínimo"
                    className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-gray-700">Valor Mínimo (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={couponFormData.min_order_cents || ''}
                    onChange={(e) => setCouponFormData(prev => ({ ...prev, min_order_cents: parseFloat(e.target.value) || 0 }))}
                    className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Máximo de Usos</Label>
                  <Input
                    type="number"
                    min="1"
                    value={couponFormData.max_uses}
                    onChange={(e) => setCouponFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                    placeholder="Ilimitado"
                    className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Válido Até
                  </Label>
                  <Input
                    type="date"
                    value={couponFormData.valid_until}
                    onChange={(e) => setCouponFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCouponForm(false)}
                  className="rounded-xl border-gray-300 text-gray-700"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateCoupon}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Criar Cupom
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{coupons.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-600">{activeCoupons.length}</div>
              <div className="text-sm text-gray-600">Ativos</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-400">{inactiveCoupons.length}</div>
              <div className="text-sm text-gray-600">Inativos</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {coupons.reduce((acc, c) => acc + c.current_uses, 0)}
              </div>
              <div className="text-sm text-gray-600">Usos</div>
            </CardContent>
          </Card>
        </div>

        {/* Coupon Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-gray-100 rounded-xl p-1">
            <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600">
              Ativos ({activeCoupons.length})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-600">
              Inativos ({inactiveCoupons.length})
            </TabsTrigger>
          </TabsList>

          {[
            { key: 'active', data: activeCoupons },
            { key: 'inactive', data: inactiveCoupons }
          ].map(({ key, data }) => (
            <TabsContent key={key} value={key} className="mt-4">
              {data.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                  <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum cupom {key === 'active' ? 'ativo' : 'inativo'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.map(coupon => (
                    <Card key={coupon.id} className={`rounded-xl ${coupon.is_active ? 'bg-white' : 'bg-gray-50 opacity-70'}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div 
                              className="bg-emerald-100 text-emerald-700 font-mono font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-emerald-200"
                              onClick={() => copyCouponCode(coupon.code)}
                            >
                              {coupon.code}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge className={coupon.discount_type === 'percentage' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                                  {coupon.discount_type === 'percentage' 
                                    ? `${coupon.discount_value}%` 
                                    : formatPrice(coupon.discount_value)
                                  }
                                </Badge>
                                {coupon.min_photos && (
                                  <span className="text-xs text-gray-500">
                                    mín. {coupon.min_photos} fotos
                                  </span>
                                )}
                              </div>
                              {coupon.description && (
                                <p className="text-sm text-gray-500 mt-1">{coupon.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ''} usos
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleCouponActive(coupon.id, !coupon.is_active)}
                              className="rounded-lg"
                            >
                              {coupon.is_active ? 'Desativar' : 'Ativar'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="text-red-500 hover:text-red-700 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

export default FotoFacilDiscountsManager;