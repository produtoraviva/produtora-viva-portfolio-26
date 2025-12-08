import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Ticket, Percent, DollarSign, Copy, Calendar, Users, ImageIcon, X, Check, Settings2, Clock, Tag, Sparkles } from 'lucide-react';

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

export function FotoFacilCouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
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
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('fotofacil_coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons((data || []) as Coupon[]);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast.error('Erro ao carregar cupons');
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

  const handleCreate = async () => {
    if (!formData.code.trim()) {
      toast.error('Informe o código do cupom');
      return;
    }
    if (formData.discount_value <= 0) {
      toast.error('Informe o valor do desconto');
      return;
    }

    try {
      const { error } = await supabase
        .from('fotofacil_coupons')
        .insert({
          code: formData.code.toUpperCase().trim(),
          description: formData.description.trim() || null,
          discount_type: formData.discount_type,
          discount_value: formData.discount_type === 'percentage' 
            ? formData.discount_value 
            : formData.discount_value * 100,
          min_order_cents: formData.min_order_cents * 100,
          min_photos: formData.min_photos ? parseInt(formData.min_photos) : null,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          valid_until: formData.valid_until || null
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Já existe um cupom com este código');
          return;
        }
        throw error;
      }
      
      toast.success('Cupom criado com sucesso');
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_order_cents: 0,
        min_photos: '',
        max_uses: '',
        valid_until: ''
      });
      setShowForm(false);
      loadCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Erro ao criar cupom');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este cupom?')) return;

    try {
      const { error } = await supabase
        .from('fotofacil_coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Cupom excluído');
      loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Erro ao excluir cupom');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-emerald-600" />
            Cupons de Desconto
          </h2>
          <p className="text-gray-600 text-sm mt-1">Crie e gerencie cupons promocionais</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg"
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancelar' : 'Novo Cupom'}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-emerald-600 text-white pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Criar Novo Cupom
            </CardTitle>
            <CardDescription className="text-emerald-100">
              Preencha os dados para criar um cupom promocional
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coupon-code" className="text-gray-700 font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Código do Cupom *
                </Label>
                <Input
                  id="coupon-code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="DESCONTO10"
                  className="uppercase bg-white border-gray-300 text-gray-900 rounded-xl h-11 font-mono text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-desc" className="text-gray-700 font-medium">
                  Descrição (opcional)
                </Label>
                <Input
                  id="coupon-desc"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="10% de desconto na primeira compra"
                  className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                />
              </div>
            </div>

            {/* Discount Settings */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-emerald-600" />
                Configurações do Desconto
              </h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-gray-700">Tipo de Desconto *</Label>
                  <Select 
                    value={formData.discount_type}
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setFormData(prev => ({ ...prev, discount_type: value }))
                    }
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        <span className="flex items-center gap-2">
                          <Percent className="w-4 h-4" />
                          Porcentagem (%)
                        </span>
                      </SelectItem>
                      <SelectItem value="fixed">
                        <span className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Valor Fixo (R$)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coupon-value" className="text-gray-700">
                    Valor do Desconto * {formData.discount_type === 'percentage' ? '(%)' : '(R$)'}
                  </Label>
                  <Input
                    id="coupon-value"
                    type="number"
                    min="0"
                    step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                    value={formData.discount_value || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                    placeholder={formData.discount_type === 'percentage' ? '10' : '5.00'}
                    className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coupon-min" className="text-gray-700">Valor Mínimo (R$)</Label>
                  <Input
                    id="coupon-min"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.min_order_cents || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_order_cents: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="p-4 bg-blue-50 rounded-xl space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                Requisitos & Limites
              </h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="coupon-min-photos" className="text-gray-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Mínimo de Fotos
                  </Label>
                  <Input
                    id="coupon-min-photos"
                    type="number"
                    min="1"
                    value={formData.min_photos}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_photos: e.target.value }))}
                    placeholder="Sem mínimo"
                    className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                  />
                  <p className="text-xs text-gray-500">Deixe vazio para sem limite</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coupon-max-uses" className="text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Máximo de Usos
                  </Label>
                  <Input
                    id="coupon-max-uses"
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                    placeholder="Ilimitado"
                    className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coupon-expires" className="text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Válido Até
                  </Label>
                  <Input
                    id="coupon-expires"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    className="bg-white border-gray-300 text-gray-900 rounded-xl h-11"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6"
              >
                <Check className="w-4 h-4 mr-2" />
                Criar Cupom
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 rounded-xl">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{coupons.length}</div>
            <div className="text-sm text-gray-600">Total de Cupons</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{activeCoupons.length}</div>
            <div className="text-sm text-gray-600">Cupons Ativos</div>
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
            <div className="text-sm text-gray-600">Usos Totais</div>
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
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Todos ({coupons.length})
          </TabsTrigger>
        </TabsList>

        {[
          { key: 'active', data: activeCoupons },
          { key: 'inactive', data: inactiveCoupons },
          { key: 'all', data: coupons }
        ].map(({ key, data }) => (
          <TabsContent key={key} value={key} className="mt-4">
            {data.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum cupom encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.map(coupon => (
                  <Card
                    key={coupon.id}
                    className={`overflow-hidden rounded-xl transition-all ${
                      coupon.is_active 
                        ? 'bg-white border-gray-200 hover:shadow-md' 
                        : 'bg-gray-50 border-gray-200 opacity-70'
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Code Section */}
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 md:p-6 flex flex-col justify-center items-center min-w-[160px]">
                          <code className="text-xl md:text-2xl font-bold tracking-wider">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="mt-2 text-xs opacity-80 hover:opacity-100 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Copiar
                          </button>
                        </div>

                        {/* Details Section */}
                        <div className="flex-1 p-4 md:p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                {coupon.discount_type === 'percentage' ? (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                    <Percent className="w-3 h-3 mr-1" />
                                    {coupon.discount_value}% OFF
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-100 text-blue-700 border-0">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    {formatPrice(coupon.discount_value)} OFF
                                  </Badge>
                                )}
                                {!coupon.is_active && (
                                  <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                                    Inativo
                                  </Badge>
                                )}
                              </div>
                              {coupon.description && (
                                <p className="text-gray-600 text-sm">{coupon.description}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Switch
                                checked={coupon.is_active}
                                onCheckedChange={(checked) => handleToggleActive(coupon.id, checked)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(coupon.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Requirements */}
                          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ''} usos
                            </span>
                            {coupon.min_order_cents > 0 && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                Mín: {formatPrice(coupon.min_order_cents)}
                              </span>
                            )}
                            {coupon.min_photos && (
                              <span className="flex items-center gap-1">
                                <ImageIcon className="w-4 h-4" />
                                Mín: {coupon.min_photos} fotos
                              </span>
                            )}
                            {coupon.valid_until && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Até: {new Date(coupon.valid_until).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
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
  );
}
