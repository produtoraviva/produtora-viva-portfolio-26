import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// GCS Configuration
const GCS_CLIENT_EMAIL = Deno.env.get('GCS_CLIENT_EMAIL');
const GCS_PRIVATE_KEY = Deno.env.get('GCS_PRIVATE_KEY')?.replace(/\\n/g, '\n');
const GCS_BUCKET_NAME = Deno.env.get('GCS_BUCKET_NAME') || 'rubensphotofilm';

function pemToDer(pem: string): ArrayBuffer {
  const lines = pem.split('\n');
  const base64 = lines.filter(line => !line.startsWith('-----')).join('');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate V4 signed URL for GCS
async function generateSignedUrl(
  objectPath: string,
  expirationMinutes: number = 60
): Promise<string> {
  const host = `${GCS_BUCKET_NAME}.storage.googleapis.com`;
  const canonicalUri = `/${encodeURIComponent(objectPath).replace(/%2F/g, '/')}`;
  
  // Create string to sign for V4 signing
  const datestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const credentialScope = `${datestamp.slice(0, 8)}/auto/storage/goog4_request`;
  const credential = `${GCS_CLIENT_EMAIL}/${credentialScope}`;
  
  const queryParams = new URLSearchParams({
    'X-Goog-Algorithm': 'GOOG4-RSA-SHA256',
    'X-Goog-Credential': credential,
    'X-Goog-Date': datestamp,
    'X-Goog-Expires': String(expirationMinutes * 60),
    'X-Goog-SignedHeaders': 'host',
  });
  
  const canonicalQueryString = queryParams.toString();
  
  const canonicalRequest = [
    'GET',
    canonicalUri,
    canonicalQueryString,
    `host:${host}`,
    '',
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');
  
  const encoder = new TextEncoder();
  const canonicalRequestHash = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(canonicalRequest)
  );
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const stringToSign = [
    'GOOG4-RSA-SHA256',
    datestamp,
    credentialScope,
    canonicalRequestHashHex,
  ].join('\n');
  
  // Sign with private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(GCS_PRIVATE_KEY!),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    encoder.encode(stringToSign)
  );
  
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Goog-Signature=${signatureHex}`;
}

// Extract GCS path from URL and convert to original path
function getOriginalPath(url: string): string | null {
  // Handle both public URLs and storage.googleapis.com URLs
  const patterns = [
    /https:\/\/storage\.googleapis\.com\/[^\/]+\/(.+)/,
    /https:\/\/[^\/]+\.storage\.googleapis\.com\/(.+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      let path = match[1];
      // Convert watermarked path to original path
      if (path.includes('watermarked/')) {
        path = path.replace('watermarked/', 'originals/');
      }
      return path;
    }
  }
  return null;
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

    // Generate signed URLs for original files (without watermark)
    const formattedItems = await Promise.all((items || []).map(async (item) => {
      let downloadUrl = null;
      let thumbUrl = null;
      
      if (item.fotofacil_photos?.url) {
        // Get the original file path and generate a signed URL
        const originalPath = getOriginalPath(item.fotofacil_photos.url);
        if (originalPath && GCS_CLIENT_EMAIL && GCS_PRIVATE_KEY) {
          try {
            // Generate signed URL for original (unwatermarked) file - valid for 60 minutes
            downloadUrl = await generateSignedUrl(originalPath, 60);
            console.log(`Generated signed URL for: ${originalPath}`);
          } catch (err) {
            console.error('Error generating signed URL:', err);
            // Fallback to the stored URL
            downloadUrl = item.fotofacil_photos.url;
          }
        } else {
          downloadUrl = item.fotofacil_photos.url;
        }
        
        // Use watermarked version for thumbnail
        thumbUrl = item.fotofacil_photos.thumb_url || item.fotofacil_photos.url;
      }
      
      return {
        id: item.id,
        title_snapshot: item.title_snapshot,
        photo: {
          id: item.fotofacil_photos?.id || item.photo_id,
          url: downloadUrl, // This is now the signed URL to the original file
          thumb_url: thumbUrl
        }
      };
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