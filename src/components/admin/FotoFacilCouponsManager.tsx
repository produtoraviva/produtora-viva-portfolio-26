import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Ticket, Percent, DollarSign, Copy } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_cents: number;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Cupons de Desconto
          </CardTitle>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cupom
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create Form */}
          {showForm && (
            <div className="p-4 border border-dashed rounded-lg space-y-4">
              <h4 className="font-medium">Novo Cupom de Desconto</h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="coupon-code">Código *</Label>
                  <Input
                    id="coupon-code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="DESCONTO10"
                    className="uppercase"
                  />
                </div>
                <div>
                  <Label htmlFor="coupon-desc">Descrição</Label>
                  <Input
                    id="coupon-desc"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="10% de desconto na primeira compra"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Tipo de Desconto *</Label>
                  <Select 
                    value={formData.discount_type}
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setFormData(prev => ({ ...prev, discount_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="coupon-value">
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
                  />
                </div>
                <div>
                  <Label htmlFor="coupon-min">Valor Mínimo do Pedido (R$)</Label>
                  <Input
                    id="coupon-min"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.min_order_cents || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_order_cents: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="coupon-max-uses">Máximo de Usos (vazio = ilimitado)</Label>
                  <Input
                    id="coupon-max-uses"
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                    placeholder="Ilimitado"
                  />
                </div>
                <div>
                  <Label htmlFor="coupon-expires">Válido Até (vazio = sem expiração)</Label>
                  <Input
                    id="coupon-expires"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate}>Criar Cupom</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {/* Coupon List */}
          {coupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum cupom cadastrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map(coupon => (
                <div
                  key={coupon.id}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-2 min-w-32">
                    <code className="px-3 py-1 bg-muted rounded font-mono font-bold">
                      {coupon.code}
                    </code>
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {coupon.discount_type === 'percentage' ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <Percent className="w-4 h-4" />
                          {coupon.discount_value}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <DollarSign className="w-4 h-4" />
                          {formatPrice(coupon.discount_value)}
                        </span>
                      )}
                      {coupon.description && (
                        <span className="text-sm text-muted-foreground">- {coupon.description}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                      <span>Usos: {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ''}</span>
                      {coupon.min_order_cents > 0 && (
                        <span>Mín: {formatPrice(coupon.min_order_cents)}</span>
                      )}
                      {coupon.valid_until && (
                        <span>Até: {new Date(coupon.valid_until).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={coupon.is_active}
                        onCheckedChange={(checked) => handleToggleActive(coupon.id, checked)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {coupon.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(coupon.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}