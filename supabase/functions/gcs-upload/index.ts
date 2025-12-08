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

// JWT Token for GCS authentication
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

// Upload file to GCS
async function uploadToGCS(
  accessToken: string,
  objectPath: string,
  data: Uint8Array,
  contentType: string
): Promise<string> {
  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${GCS_BUCKET_NAME}/o?uploadType=media&name=${encodeURIComponent(objectPath)}`;

  console.log(`Uploading to GCS: ${objectPath} (${data.length} bytes)`);
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000',
    },
    body: data,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('GCS upload failed:', error);
    throw new Error(`GCS upload failed: ${error}`);
  }

  const result = await response.json();
  console.log(`Upload successful: ${result.name}`);
  
  return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${objectPath}`;
}

// Fetch watermark from GCS
async function fetchWatermark(accessToken: string): Promise<Uint8Array | null> {
  try {
    const watermarkPath = 'watermarks/selo.png';
    const url = `https://storage.googleapis.com/storage/v1/b/${GCS_BUCKET_NAME}/o/${encodeURIComponent(watermarkPath)}?alt=media`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
      console.log('Watermark not found, status:', response.status);
      return null;
    }
    
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (error) {
    console.error('Error fetching watermark:', error);
    return null;
  }
}

// Create watermarked image with single large centered watermark at 100% size
async function createWatermarkedImage(
  originalData: Uint8Array,
  watermarkData: Uint8Array,
  contentType: string
): Promise<Uint8Array> {
  const { Image } = await import("https://deno.land/x/imagescript@1.2.15/mod.ts");
  
  try {
    console.log('Decoding original image...');
    const originalImage = await Image.decode(originalData);
    const width = originalImage.width;
    const height = originalImage.height;
    console.log(`Original image size: ${width}x${height}`);
    
    console.log('Decoding watermark...');
    const watermark = await Image.decode(watermarkData);
    
    // Scale watermark to 100% of the smaller image dimension (single large centered watermark)
    const targetWatermarkSize = Math.min(width, height);
    const watermarkScale = targetWatermarkSize / Math.min(watermark.width, watermark.height);
    const scaledWatermarkWidth = Math.floor(watermark.width * watermarkScale);
    const scaledWatermarkHeight = Math.floor(watermark.height * watermarkScale);
    
    console.log(`Scaling watermark to ${scaledWatermarkWidth}x${scaledWatermarkHeight}`);
    const scaledWatermark = watermark.resize(scaledWatermarkWidth, scaledWatermarkHeight);
    
    // Apply opacity to watermark (50% opacity)
    for (let i = 0; i < scaledWatermark.width * scaledWatermark.height; i++) {
      const pixel = scaledWatermark.getPixelAt((i % scaledWatermark.width) + 1, Math.floor(i / scaledWatermark.width) + 1);
      const alpha = (pixel >> 24) & 0xff;
      const newAlpha = Math.floor(alpha * 0.5);
      scaledWatermark.setPixelAt(
        (i % scaledWatermark.width) + 1, 
        Math.floor(i / scaledWatermark.width) + 1,
        (pixel & 0x00FFFFFF) | (newAlpha << 24)
      );
    }
    
    // Center the watermark on the image (single watermark, not tiled)
    const centerX = Math.floor((width - scaledWatermarkWidth) / 2);
    const centerY = Math.floor((height - scaledWatermarkHeight) / 2);
    
    console.log('Applying centered watermark...');
    originalImage.composite(scaledWatermark, centerX, centerY);
    
    // Encode to JPEG at 75% quality
    console.log('Encoding watermarked image...');
    const watermarkedData = await originalImage.encodeJPEG(75);
    
    console.log(`Watermarked image size: ${watermarkedData.length} bytes`);
    return watermarkedData;
  } catch (error) {
    console.error('Error creating watermarked image:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GCS_PROJECT_ID || !GCS_CLIENT_EMAIL || !GCS_PRIVATE_KEY) {
      throw new Error('GCS credentials not configured');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const eventId = formData.get('eventId') as string | null;
    const fileName = formData.get('fileName') as string | null;
    const generateWatermark = formData.get('generateWatermark') !== 'false';

    if (!file) {
      throw new Error('No file provided');
    }

    if (!type || !['fotofacil', 'portfolio'].includes(type)) {
      throw new Error('Invalid type. Must be "fotofacil" or "portfolio"');
    }

    console.log(`Processing upload: type=${type}, fileName=${file.name}, size=${file.size}, generateWatermark=${generateWatermark}`);

    const accessToken = await getAccessToken();
    
    const fileBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(fileBuffer);
    
    // Generate unique filename
    const timestamp = Date.now();
    const uniqueId = crypto.randomUUID().slice(0, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const baseName = fileName || file.name.replace(/\.[^/.]+$/, '');
    const safeBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const finalFileName = `${timestamp}-${uniqueId}-${safeBaseName}`;
    
    // Build paths
    let originalPath: string;
    let watermarkedPath: string;
    
    if (type === 'fotofacil' && eventId) {
      originalPath = `originals/fotofacil/${eventId}/${finalFileName}.${extension}`;
      watermarkedPath = `watermarked/fotofacil/${eventId}/${finalFileName}.jpg`;
    } else if (type === 'fotofacil') {
      originalPath = `originals/fotofacil/${finalFileName}.${extension}`;
      watermarkedPath = `watermarked/fotofacil/${finalFileName}.jpg`;
    } else {
      originalPath = `originals/portfolio/${finalFileName}.${extension}`;
      watermarkedPath = `watermarked/portfolio/${finalFileName}.jpg`;
    }

    // Upload original (for download after purchase)
    const originalUrl = await uploadToGCS(accessToken, originalPath, fileData, file.type);
    console.log(`Original uploaded: ${originalUrl}`);

    let watermarkedUrl = originalUrl;
    
    // Generate watermarked version if requested
    if (generateWatermark && type === 'fotofacil') {
      console.log('Fetching watermark...');
      const watermarkData = await fetchWatermark(accessToken);
      
      if (watermarkData) {
        console.log('Creating watermarked image...');
        try {
          const watermarkedData = await createWatermarkedImage(fileData, watermarkData, file.type);
          watermarkedUrl = await uploadToGCS(accessToken, watermarkedPath, watermarkedData, 'image/jpeg');
          console.log(`Watermarked version uploaded: ${watermarkedUrl}`);
        } catch (error) {
          console.error('Failed to create watermark, using original:', error);
          // Fallback: upload original as watermarked version
          watermarkedUrl = await uploadToGCS(accessToken, watermarkedPath, fileData, file.type);
        }
      } else {
        console.log('No watermark found, uploading original as watermarked version');
        watermarkedUrl = await uploadToGCS(accessToken, watermarkedPath, fileData, file.type);
      }
    } else {
      // For portfolio or when watermark is disabled, just copy original
      watermarkedUrl = await uploadToGCS(accessToken, watermarkedPath, fileData, file.type);
      console.log(`Public version uploaded: ${watermarkedUrl}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        originalUrl,
        watermarkedUrl,
        originalPath,
        watermarkedPath,
        fileName: `${finalFileName}.${extension}`,
        contentType: file.type,
        size: fileData.length,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Upload error:', error);
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