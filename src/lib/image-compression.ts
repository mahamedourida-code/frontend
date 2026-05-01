/**
 * Image compression utility for frontend
 * Reduces image file size if it exceeds the specified threshold
 * Uses Canvas API for lossy compression (JPEG)
 */

const MAX_IMAGE_SIZE_KB = 500; // 500 KB threshold
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_KB * 1024;

interface CompressionResult {
  file: File;
  compressed: boolean;
  originalSize: number;
  compressedSize: number;
  reduction: number; // percentage
}

/**
 * Compress an image file if it exceeds MAX_IMAGE_SIZE_BYTES
 * Returns original file if under threshold or if compression fails
 */
export async function compressImageIfNeeded(file: File): Promise<CompressionResult> {
  // Only process image files
  if (!file.type.startsWith('image/')) {
    return {
      file,
      compressed: false,
      originalSize: file.size,
      compressedSize: file.size,
      reduction: 0
    };
  }

  const originalSize = file.size;

  // If file is already under threshold, return as-is
  if (originalSize <= MAX_IMAGE_SIZE_BYTES) {
    return {
      file,
      compressed: false,
      originalSize,
      compressedSize: originalSize,
      reduction: 0
    };
  }

  try {
    const compressedFile = await compressImage(file);
    const compressedSize = compressedFile.size;
    const reduction = Math.round(((originalSize - compressedSize) / originalSize) * 100);


    return {
      file: compressedFile,
      compressed: true,
      originalSize,
      compressedSize,
      reduction
    };
  } catch (error) {
    // Return original file on error
    return {
      file,
      compressed: false,
      originalSize,
      compressedSize: originalSize,
      reduction: 0
    };
  }
}

/**
 * Batch compress multiple image files
 */
export async function compressImages(files: File[]): Promise<CompressionResult[]> {
  return Promise.all(files.map(file => compressImageIfNeeded(file)));
}

/**
 * Internal: Compress a single image using Canvas API
 * Iteratively reduces quality and/or dimensions until target size is reached
 */
async function compressImage(file: File): Promise<File> {
  const blob = await file.slice().arrayBuffer();
  const image = await createImageFromBlob(new Blob([blob], { type: file.type }));

  let quality = 0.9; // Start with high quality
  let scale = 1; // Start at full scale
  const minQuality = 0.3; // Minimum acceptable quality
  const minScale = 0.5; // Minimum acceptable scale

  while (quality > minQuality || scale > minScale) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas 2D context');
    }

    // Apply scaling
    const newWidth = Math.max(1, Math.round(image.width * scale));
    const newHeight = Math.max(1, Math.round(image.height * scale));

    canvas.width = newWidth;
    canvas.height = newHeight;

    // Draw image on canvas
    ctx.drawImage(image, 0, 0, newWidth, newHeight);

    // Convert to JPEG blob with current quality
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob || new Blob()),
        'image/jpeg',
        quality
      );
    });

    // Check if we've reached target size
    if (blob.size <= MAX_IMAGE_SIZE_BYTES) {
      return new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
    }

    // Reduce quality first, then scale
    if (quality > minQuality) {
      quality = Math.max(minQuality, quality - 0.1);
    } else if (scale > minScale) {
      scale = Math.max(minScale, scale * 0.85);
      quality = 0.7; // Reset quality when scaling down
    } else {
      // If we can't reach the target, return the smallest we got
      return new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
    }
  }

  // Fallback: return original if all attempts fail
  return file;
}

/**
 * Helper: Create an image element from a blob
 */
function createImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
