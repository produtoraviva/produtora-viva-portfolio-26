import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GCS Configuration
const GCS_CLIENT_EMAIL = Deno.env.get('GCS_CLIENT_EMAIL');
const GCS_PRIVATE_KEY = Deno.env.get('GCS_PRIVATE_KEY')?.replace(/\\n/g, '\n');
const GCS_BUCKET_NAME = Deno.env.get('GCS_BUCKET_NAME') || 'rubensphotofilm';

function base64UrlEncode(data: Uint8Array): string {
  return base64Encode(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

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
  const now = Math.floor(Date.now() / 1000);
  const expiration = now + (expirationMinutes * 60);
  
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GCS_CLIENT_EMAIL || !GCS_PRIVATE_KEY) {
      throw new Error('GCS credentials not configured');
    }

    const { objectPath, expirationMinutes = 60 } = await req.json();

    if (!objectPath) {
      throw new Error('objectPath is required');
    }

    console.log(`Generating signed URL for: ${objectPath}, expires in ${expirationMinutes} minutes`);

    const signedUrl = await generateSignedUrl(objectPath, expirationMinutes);

    return new Response(
      JSON.stringify({
        success: true,
        signedUrl,
        expiresIn: expirationMinutes * 60,
        expiresAt: new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Signed URL error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
