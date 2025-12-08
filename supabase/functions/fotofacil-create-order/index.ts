import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple hash function for CPF
async function hashCPF(cpf: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(cpf + 'fotofacil_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate secure random token
function generateToken(length: number = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!mpAccessToken) {
      console.error('Missing Mercado Pago access token');
      return new Response(
        JSON.stringify({ error: 'Payment configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const body = await req.json();
    const { customer, items } = body;

    console.log('Received order request:', { customer: { ...customer, cpf: '***' }, itemCount: items?.length });

    // Validate input
    if (!customer?.name || !customer?.email || !customer?.cpf) {
      return new Response(
        JSON.stringify({ error: 'Dados do cliente incompletos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum item no pedido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate CPF format (11 digits)
    const cpfDigits = customer.cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      return new Response(
        JSON.stringify({ error: 'CPF inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total
    let totalCents = 0;
    for (const item of items) {
      totalCents += Number(item.price_cents) || 0;
    }

    if (totalCents <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valor do pedido inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash CPF for storage
    const cpfHash = await hashCPF(cpfDigits);

    // Find or create customer
    let customerId: string;
    const { data: existingCustomer } = await supabase
      .from('fotofacil_customers')
      .select('id')
      .eq('cpf_hash', cpfHash)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('fotofacil_customers')
        .insert({
          name: customer.name,
          email: customer.email.toLowerCase(),
          cpf_hash: cpfHash
        })
        .select('id')
        .single();

      if (customerError) {
        console.error('Error creating customer:', customerError);
        return new Response(
          JSON.stringify({ error: 'Erro ao registrar cliente' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      customerId = newCustomer.id;
    }

    // Generate delivery token
    const deliveryToken = generateToken(64);
    const deliveryExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('fotofacil_orders')
      .insert({
        customer_id: customerId,
        total_cents: totalCents,
        currency: 'BRL',
        status: 'pending',
        delivery_token: deliveryToken,
        delivery_expires_at: deliveryExpiresAt
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar pedido' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order created:', order.id);

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      photo_id: item.photo_id,
      title_snapshot: item.title || 'Foto',
      price_cents_snapshot: item.price_cents
    }));

    const { error: itemsError } = await supabase
      .from('fotofacil_order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
    }

    // Create Mercado Pago payment
    const mpItems = items.map((item: any, idx: number) => ({
      id: `photo-${item.photo_id}`,
      title: item.title || `Foto ${idx + 1}`,
      description: 'Foto em alta resolução',
      category_id: 'photos',
      quantity: 1,
      unit_price: Number(item.price_cents) / 100
    }));

    const mpPayload = {
      transaction_amount: totalCents / 100,
      description: `Pedido FotoFácil - ${items.length} foto(s)`,
      payment_method_id: 'pix',
      payer: {
        email: customer.email.toLowerCase(),
        first_name: customer.name.split(' ')[0],
        last_name: customer.name.split(' ').slice(1).join(' ') || customer.name.split(' ')[0],
        identification: {
          type: 'CPF',
          number: cpfDigits
        }
      },
      external_reference: `fotofacil_${order.id}`,
      notification_url: `${supabaseUrl}/functions/v1/fotofacil-webhook`
    };

    console.log('Creating Mercado Pago payment...');

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpAccessToken}`,
        'X-Idempotency-Key': order.id
      },
      body: JSON.stringify(mpPayload)
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Mercado Pago error:', mpData);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao processar pagamento',
          details: mpData.message || 'Erro desconhecido'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Mercado Pago payment created:', mpData.id);

    // Update order with MP data
    const { error: updateError } = await supabase
      .from('fotofacil_orders')
      .update({
        mercadopago_payment_id: mpData.id?.toString(),
        qr_code: mpData.point_of_interaction?.transaction_data?.qr_code || null,
        qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64 || null,
        pix_copia_cola: mpData.point_of_interaction?.transaction_data?.qr_code || null
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order with MP data:', updateError);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        mercadopagoId: mpData.id,
        qrCode: mpData.point_of_interaction?.transaction_data?.qr_code || '',
        qrCodeBase64: mpData.point_of_interaction?.transaction_data?.qr_code_base64 || '',
        pixCopiaCola: mpData.point_of_interaction?.transaction_data?.qr_code || '',
        expiresAt: mpData.date_of_expiration
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fotofacil-create-order:', error);
    return new Response(
      JSON.stringify({ error: `Erro interno: ${error.message || 'Unknown error'}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});