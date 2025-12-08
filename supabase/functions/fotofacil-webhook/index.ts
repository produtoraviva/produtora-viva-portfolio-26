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

    if (!supabaseUrl || !supabaseServiceKey || !mpAccessToken) {
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
    console.log('Webhook received:', JSON.stringify(body));

    // Handle different notification types
    const { type, data, action } = body;

    if (type === 'payment' && data?.id) {
      const paymentId = data.id;
      console.log('Processing payment notification:', paymentId);

      // Get payment details from Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`
        }
      });

      if (!mpResponse.ok) {
        console.error('Error fetching payment from MP:', await mpResponse.text());
        return new Response(
          JSON.stringify({ error: 'Error fetching payment' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const payment = await mpResponse.json();
      console.log('Payment status:', payment.status);

      // Extract order ID from external_reference
      const externalRef = payment.external_reference;
      if (!externalRef || !externalRef.startsWith('fotofacil_')) {
        console.log('Not a fotofacil payment, ignoring');
        return new Response(
          JSON.stringify({ ok: true, message: 'Ignored - not fotofacil' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const orderId = externalRef.replace('fotofacil_', '');
      console.log('Order ID:', orderId);

      // Map Mercado Pago status to our status
      let orderStatus = 'pending';
      if (payment.status === 'approved') {
        orderStatus = 'paid';
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        orderStatus = 'failed';
      }

      // Update order
      const updateData: any = {
        status: orderStatus,
        mercadopago_payment_id: paymentId.toString(),
        updated_at: new Date().toISOString()
      };

      // If paid, set delivery info
      if (orderStatus === 'paid') {
        // Regenerate delivery token and expiry
        const deliveryToken = generateToken(64);
        const deliveryExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        updateData.delivery_token = deliveryToken;
        updateData.delivery_expires_at = deliveryExpiresAt;
      }

      const { error: updateError } = await supabase
        .from('fotofacil_orders')
        .update(updateData)
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
        return new Response(
          JSON.stringify({ error: 'Error updating order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Order updated successfully:', orderId, 'Status:', orderStatus);

      // If paid, send email notification
      if (orderStatus === 'paid') {
        // Get customer email
        const { data: order } = await supabase
          .from('fotofacil_orders')
          .select('*, fotofacil_customers(*)')
          .eq('id', orderId)
          .single();

        if (order?.fotofacil_customers?.email) {
          const deliveryUrl = `${supabaseUrl.replace('.supabase.co', '.lovableproject.com')}/fotofacil/entrega/${orderId}/${order.delivery_token}`;
          
          console.log('Payment approved! Delivery URL:', deliveryUrl);
          console.log('Customer email:', order.fotofacil_customers.email);
          
          // TODO: Integrate email sending (Resend, etc.)
          // For now, just log the delivery info
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fotofacil-webhook:', error);
    return new Response(
      JSON.stringify({ error: `Webhook error: ${error.message || 'Unknown error'}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateToken(length: number = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}