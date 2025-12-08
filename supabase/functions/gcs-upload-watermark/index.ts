import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GCS Configuration
const GCS_PROJECT_ID = Deno.env.get('GCS_PROJECT_ID');
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

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: GCS_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/devstorage.full_control',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: exp,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signatureInput = `${headerB64}.${payloadB64}`;

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
    encoder.encode(signatureInput)
  );

  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  const jwt = `${signatureInput}.${signatureB64}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    console.error('Token exchange failed:', tokenData);
    throw new Error('Failed to get access token');
  }
  
  return tokenData.access_token;
}

async function uploadToGCS(
  accessToken: string,
  objectPath: string,
  data: Uint8Array,
  contentType: string
): Promise<string> {
  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${GCS_BUCKET_NAME}/o?uploadType=media&name=${encodeURIComponent(objectPath)}`;

  console.log(`Uploading watermark to GCS: ${objectPath} (${data.length} bytes)`);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, max-age=0', // Don't cache watermark so updates are immediate
    },
    body: data,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('GCS upload failed:', error);
    throw new Error(`GCS upload failed: ${error}`);
  }

  const result = await response.json();
  console.log(`Watermark upload successful: ${result.name}`);

  return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${objectPath}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Watermark upload request received');
    
    if (!GCS_PROJECT_ID || !GCS_CLIENT_EMAIL || !GCS_PRIVATE_KEY) {
      console.error('GCS credentials not configured');
      throw new Error('GCS credentials not configured');
    }

    // Parse the request body - handle both FormData and raw body
    let fileData: Uint8Array;
    let contentType = 'image/png';
    
    const reqContentType = req.headers.get('content-type') || '';
    
    if (reqContentType.includes('multipart/form-data')) {
      console.log('Processing as FormData');
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        throw new Error('No file provided in FormData');
      }

      console.log(`File received: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      const fileBuffer = await file.arrayBuffer();
      fileData = new Uint8Array(fileBuffer);
      contentType = file.type || 'image/png';
    } else {
      console.log('Processing as raw body');
      const arrayBuffer = await req.arrayBuffer();
      fileData = new Uint8Array(arrayBuffer);
    }

    if (fileData.length === 0) {
      throw new Error('Empty file received');
    }

    console.log(`Processing watermark: ${fileData.length} bytes`);

    const accessToken = await getAccessToken();
    console.log('GCS access token obtained');

    // Upload watermark to fixed location
    const watermarkPath = 'watermarks/selo.png';
    const watermarkUrl = await uploadToGCS(
      accessToken,
      watermarkPath,
      fileData,
      contentType
    );

    console.log(`Watermark uploaded successfully: ${watermarkUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        watermarkUrl,
        watermarkPath,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Watermark upload error:', error);
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