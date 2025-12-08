import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('fotofacil_orders')
      .select('id, status, mercadopago_payment_id, delivery_token')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ error: 'Pedido não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If already paid, return success
    if (order.status === 'paid') {
      return new Response(
        JSON.stringify({ 
          status: 'paid',
          deliveryToken: order.delivery_token
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check with Mercado Pago if we have a payment ID
    if (order.mercadopago_payment_id && mpAccessToken) {
      try {
        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${order.mercadopago_payment_id}`,
          {
            headers: {
              'Authorization': `Bearer ${mpAccessToken}`
            }
          }
        );

        if (mpResponse.ok) {
          const mpData = await mpResponse.json();
          console.log('MP payment status:', mpData.status);

          if (mpData.status === 'approved') {
            // Update order status
            const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            
            await supabase
              .from('fotofacil_orders')
              .update({ 
                status: 'paid',
                delivery_expires_at: newExpiresAt
              })
              .eq('id', orderId);

            return new Response(
              JSON.stringify({ 
                status: 'paid',
                deliveryToken: order.delivery_token
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (mpError) {
        console.error('Error checking MP payment:', mpError);
      }
    }

    return new Response(
      JSON.stringify({ status: order.status }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fotofacil-check-payment:', error);
    return new Response(
      JSON.stringify({ error: `Erro interno: ${error.message || 'Unknown error'}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});