import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

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
async function getWatermarkImage(accessToken: string): Promise<Image | null> {
  try {
    const watermarkPath = 'watermarks/selo.png';
    const url = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${watermarkPath}`;
    
    console.log('Fetching watermark from:', url);
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
      console.log('Watermark not found, status:', response.status);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const watermark = await Image.decode(new Uint8Array(arrayBuffer));
    console.log(`Watermark loaded: ${watermark.width}x${watermark.height}`);
    return watermark;
  } catch (error) {
    console.error('Error loading watermark:', error);
    return null;
  }
}

// Apply watermark to image with tiling and reduced quality
async function applyWatermarkToImage(
  imageData: Uint8Array,
  watermark: Image,
  quality: number = 70
): Promise<Uint8Array> {
  try {
    console.log('Decoding main image...');
    const mainImage = await Image.decode(imageData);
    console.log(`Main image: ${mainImage.width}x${mainImage.height}`);
    
    // Calculate watermark size (15% of the smaller dimension)
    const minDim = Math.min(mainImage.width, mainImage.height);
    const watermarkSize = Math.max(100, Math.floor(minDim * 0.15));
    
    // Resize watermark proportionally
    const scale = watermarkSize / Math.max(watermark.width, watermark.height);
    const newWatermarkWidth = Math.floor(watermark.width * scale);
    const newWatermarkHeight = Math.floor(watermark.height * scale);
    
    console.log(`Resizing watermark to: ${newWatermarkWidth}x${newWatermarkHeight}`);
    const scaledWatermark = watermark.clone().resize(newWatermarkWidth, newWatermarkHeight);
    
    // Apply opacity to watermark (50% transparency)
    for (let i = 0; i < scaledWatermark.bitmap.length; i += 4) {
      scaledWatermark.bitmap[i + 3] = Math.floor(scaledWatermark.bitmap[i + 3] * 0.5);
    }
    
    // Tile watermark across the image with spacing
    const spacingX = Math.floor(mainImage.width / 4);
    const spacingY = Math.floor(mainImage.height / 4);
    
    console.log('Tiling watermark across image...');
    for (let y = spacingY; y < mainImage.height - newWatermarkHeight; y += spacingY * 1.5) {
      for (let x = spacingX; x < mainImage.width - newWatermarkWidth; x += spacingX * 1.5) {
        mainImage.composite(scaledWatermark, Math.floor(x), Math.floor(y));
      }
    }
    
    // Encode as JPEG with reduced quality
    console.log(`Encoding with quality: ${quality}`);
    const encoded = await mainImage.encodeJPEG(quality);
    console.log(`Watermarked image size: ${encoded.length} bytes`);
    
    return encoded;
  } catch (error) {
    console.error('Error applying watermark:', error);
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

    // Upload original (never publicly exposed)
    const originalUrl = await uploadToGCS(accessToken, originalPath, fileData, file.type);
    console.log(`Original uploaded: ${originalUrl}`);

    let watermarkedUrl = originalUrl;

    // Generate and upload watermarked version for images
    if (generateWatermark && file.type.startsWith('image/')) {
      try {
        const watermark = await getWatermarkImage(accessToken);
        
        if (watermark) {
          console.log('Applying watermark...');
          const watermarkedData = await applyWatermarkToImage(fileData, watermark, 70);
          
          watermarkedUrl = await uploadToGCS(
            accessToken,
            watermarkedPath,
            watermarkedData,
            'image/jpeg'
          );
          console.log(`Watermarked version uploaded: ${watermarkedUrl}`);
        } else {
          console.log('No watermark available, uploading original to watermarked path');
          watermarkedUrl = await uploadToGCS(accessToken, watermarkedPath, fileData, file.type);
        }
      } catch (error) {
        console.error('Watermark processing failed:', error);
        // Upload original to watermarked path as fallback
        watermarkedUrl = await uploadToGCS(accessToken, watermarkedPath, fileData, file.type);
      }
    } else if (file.type.startsWith('video/')) {
      // For videos, upload to watermarked path as-is (video watermarking not supported)
      watermarkedUrl = await uploadToGCS(accessToken, watermarkedPath.replace('.jpg', `.${extension}`), fileData, file.type);
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
