export interface PrepareOptions {
  /** Longest side in pixels after resizing */
  maxSize: number;
  /** WebP quality from 0 to 1 */
  quality?: number;
}

const CONVERTIBLE = /^image\/(jpeg|png|webp)$/;

/** photo.JPG -> photo.webp */
export const webpName = (name: string): string => `${name.replace(/\.[^./\\]+$/, '')}.webp`;

/**
 * Shrinks and converts a photo to WebP in the browser before upload: much less data on weak connections.
 * The server converts again anyway (never trust the client), so any failure just returns the original file.
 * Non-images (PDF) and unsupported types pass through unchanged.
 */
export async function prepareImageForUpload(file: File, { maxSize, quality = 0.8 }: PrepareOptions): Promise<File> {
  if (!CONVERTIBLE.test(file.type) || typeof createImageBitmap !== 'function') return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    // Browsers without WebP encoding return PNG; keep the original when the result is not smaller
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file;
    return new File([blob], webpName(file.name), { type: 'image/webp' });
  } catch {
    return file;
  }
}
