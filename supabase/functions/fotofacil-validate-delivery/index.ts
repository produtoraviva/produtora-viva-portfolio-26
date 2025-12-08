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

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const body = await req.json();
    const { orderId, token } = body;

    console.log('Validating delivery access:', orderId);

    if (!orderId || !token) {
      return new Response(
        JSON.stringify({ error: 'Link inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('fotofacil_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ error: 'Pedido não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate token
    if (order.delivery_token !== token) {
      console.error('Invalid token');
      return new Response(
        JSON.stringify({ error: 'Link inválido' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if paid
    if (order.status !== 'paid') {
      console.error('Order not paid:', order.status);
      return new Response(
        JSON.stringify({ error: 'Pagamento não confirmado' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiration
    if (order.delivery_expires_at) {
      const expiresAt = new Date(order.delivery_expires_at);
      if (new Date() > expiresAt) {
        console.error('Link expired');
        return new Response(
          JSON.stringify({ error: 'Este link expirou. Entre em contato com o suporte para solicitar um novo link.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get order items with photos
    const { data: items, error: itemsError } = await supabase
      .from('fotofacil_order_items')
      .select(`
        id,
        title_snapshot,
        photo_id,
        fotofacil_photos (
          id,
          url,
          thumb_url
        )
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      return new Response(
        JSON.stringify({ error: 'Erro ao carregar fotos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark as delivered if first access
    if (!order.delivered_at) {
      await supabase
        .from('fotofacil_orders')
        .update({ delivered_at: new Date().toISOString() })
        .eq('id', orderId);
    }

    // Format response
    const formattedItems = (items || []).map(item => ({
      id: item.id,
      title_snapshot: item.title_snapshot,
      photo: item.fotofacil_photos
    }));

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          status: order.status,
          delivery_expires_at: order.delivery_expires_at,
          delivered_at: order.delivered_at
        },
        items: formattedItems
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fotofacil-validate-delivery:', error);
    return new Response(
      JSON.stringify({ error: `Erro interno: ${error.message || 'Unknown error'}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});