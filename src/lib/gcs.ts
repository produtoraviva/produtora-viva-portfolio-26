import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = 'https://ihthnipyfppatlmaajvm.supabase.co';

export interface GCSUploadResult {
  success: boolean;
  originalUrl?: string;
  watermarkedUrl?: string;
  originalPath?: string;
  watermarkedPath?: string;
  fileName?: string;
  contentType?: string;
  size?: number;
  error?: string;
}

export interface GCSSignedUrlResult {
  success: boolean;
  signedUrl?: string;
  expiresIn?: number;
  expiresAt?: string;
  error?: string;
}

export interface GCSDeleteResult {
  success: boolean;
  deleted?: string[];
  notFound?: string[];
  failed?: string[];
  summary?: {
    total: number;
    deleted: number;
    notFound: number;
    failed: number;
  };
  error?: string;
}

/**
 * Upload a file to Google Cloud Storage
 * @param file - The file to upload
 * @param type - Either 'fotofacil' or 'portfolio'
 * @param eventId - Optional event ID for fotofacil uploads
 * @param generateWatermark - Whether to generate a watermarked version (default: true)
 */
export async function uploadToGCS(
  file: File,
  type: 'fotofacil' | 'portfolio',
  eventId?: string,
  generateWatermark: boolean = true
): Promise<GCSUploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (eventId) {
      formData.append('eventId', eventId);
    }
    formData.append('generateWatermark', String(generateWatermark));

    const response = await fetch(`${SUPABASE_URL}/functions/v1/gcs-upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('GCS upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
}

/**
 * Upload multiple files to Google Cloud Storage
 * @param files - Array of files to upload
 * @param type - Either 'fotofacil' or 'portfolio'
 * @param eventId - Optional event ID for fotofacil uploads
 * @param onProgress - Optional callback for progress updates
 */
export async function uploadMultipleToGCS(
  files: File[],
  type: 'fotofacil' | 'portfolio',
  eventId?: string,
  onProgress?: (completed: number, total: number, currentFile: string) => void
): Promise<GCSUploadResult[]> {
  const results: GCSUploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i, files.length, file.name);
    
    const result = await uploadToGCS(file, type, eventId);
    results.push(result);
    
    // Small delay between uploads to avoid rate limiting
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  onProgress?.(files.length, files.length, 'Complete');
  return results;
}

/**
 * Get a signed URL for secure file download
 * @param objectPath - The path to the object in GCS (e.g., 'originals/fotofacil/event123/photo.jpg')
 * @param expirationMinutes - How long the URL should be valid (default: 60 minutes)
 */
export async function getSignedUrl(
  objectPath: string,
  expirationMinutes: number = 60
): Promise<GCSSignedUrlResult> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gcs-signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        objectPath,
        expirationMinutes,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('GCS signed URL error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate signed URL',
    };
  }
}

/**
 * Get signed URLs for multiple files
 * @param objectPaths - Array of object paths
 * @param expirationMinutes - How long the URLs should be valid
 */
export async function getMultipleSignedUrls(
  objectPaths: string[],
  expirationMinutes: number = 60
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  
  const results = await Promise.allSettled(
    objectPaths.map(path => getSignedUrl(path, expirationMinutes))
  );
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success && result.value.signedUrl) {
      urlMap.set(objectPaths[index], result.value.signedUrl);
    }
  });
  
  return urlMap;
}

/**
 * Delete files from Google Cloud Storage
 * @param objectPaths - Array of object paths to delete
 */
export async function deleteFromGCS(
  objectPaths: string[]
): Promise<GCSDeleteResult> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gcs-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ objectPaths }),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('GCS delete error:', error);
    return {
      success: false,
      error: error.message || 'Delete failed',
    };
  }
}

/**
 * Upload the watermark image to GCS
 * @param file - The watermark PNG file
 */
export async function uploadWatermark(file: File): Promise<{
  success: boolean;
  watermarkUrl?: string;
  error?: string;
}> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/gcs-upload-watermark`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Watermark upload error:', error);
    return {
      success: false,
      error: error.message || 'Watermark upload failed',
    };
  }
}

/**
 * Get the public URL for a watermarked image
 * @param originalPath - The original file path
 */
export function getWatermarkedUrl(originalPath: string): string {
  // Convert originals path to watermarked path
  return originalPath.replace('/originals/', '/watermarked/');
}

/**
 * Get the original path from a watermarked URL
 * @param watermarkedPath - The watermarked file path
 */
export function getOriginalPath(watermarkedPath: string): string {
  // Convert watermarked path to originals path
  return watermarkedPath.replace('/watermarked/', '/originals/');
}

/**
 * Extract the GCS object path from a full URL
 * @param url - The full GCS URL
 */
export function extractObjectPath(url: string): string | null {
  const bucketPattern = /https:\/\/storage\.googleapis\.com\/[^\/]+\/(.+)/;
  const match = url.match(bucketPattern);
  return match ? match[1] : null;
}
