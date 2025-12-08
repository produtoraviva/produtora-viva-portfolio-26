import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple hash function for CPF (must match create-order)
async function hashCPF(cpf: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(cpf + 'fotofacil_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
    const { type, value } = body;

    console.log('Looking up orders by:', type);

    if (!type || !value) {
      return new Response(
        JSON.stringify({ error: 'Tipo e valor são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let customerId: string | null = null;

    if (type === 'cpf') {
      // Validate CPF format (11 digits)
      const cpfDigits = value.replace(/\D/g, '');
      if (cpfDigits.length !== 11) {
        return new Response(
          JSON.stringify({ error: 'CPF inválido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Hash CPF and find customer
      const cpfHash = await hashCPF(cpfDigits);
      const { data: customer } = await supabase
        .from('fotofacil_customers')
        .select('id')
        .eq('cpf_hash', cpfHash)
        .single();

      if (customer) {
        customerId = customer.id;
      }
    } else if (type === 'email') {
      // Find customer by email
      const { data: customer } = await supabase
        .from('fotofacil_customers')
        .select('id')
        .eq('email', value.toLowerCase())
        .single();

      if (customer) {
        customerId = customer.id;
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Tipo inválido. Use "cpf" ou "email"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!customerId) {
      return new Response(
        JSON.stringify({ orders: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get orders for customer
    const { data: orders, error: ordersError } = await supabase
      .from('fotofacil_orders')
      .select('id, status, total_cents, created_at, delivery_token, delivery_expires_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw ordersError;
    }

    // Get item counts for each order
    const ordersWithCounts = await Promise.all(
      (orders || []).map(async (order) => {
        const { count } = await supabase
          .from('fotofacil_order_items')
          .select('*', { count: 'exact', head: true })
          .eq('order_id', order.id);

        return {
          ...order,
          items_count: count || 0
        };
      })
    );

    console.log(`Found ${ordersWithCounts.length} orders`);

    return new Response(
      JSON.stringify({ orders: ordersWithCounts }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fotofacil-lookup-orders:', error);
    return new Response(
      JSON.stringify({ error: `Erro interno: ${error.message || 'Unknown error'}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});