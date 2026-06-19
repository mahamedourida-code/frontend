// Client-side image downscaling — runs in the browser BEFORE upload.
//
// Large phone photos (12+ MP) are the single biggest latency cost on the
// upload → OCR path: they inflate upload time, backend memory, and vision-model
// inference. Shrinking them to a sane longest-side here cuts all three without
// any visible quality loss for document OCR.
//
// Hard guarantees:
//   - PDFs and any non-image file are returned UNCHANGED. We never re-encode
//     a PDF (that would destroy it) and never touch non-rasters.
//   - Images whose longest side is already <= MAX_LONGEST_SIDE are returned
//     unchanged — we never upscale and never needlessly re-encode small files.
//   - Any failure at any step (decode error on an exotic HEIC, no canvas
//     context, toBlob returning null, …) falls back to the ORIGINAL file.
//     This function must NEVER throw and must NEVER block an upload.

// Longest edge (px) we resize down to. 1600px keeps small print / table cells
// legible for the vision models while massively shrinking 4000px+ phone photos.
const MAX_LONGEST_SIDE = 1600

// JPEG quality for the re-encoded output. 0.85 is visually lossless for
// document photos at this resolution while cutting file size hard.
const JPEG_QUALITY = 0.85

const OUTPUT_TYPE = "image/jpeg"

type DecodedImage = {
  width: number
  height: number
  // Drawable source accepted by CanvasRenderingContext2D.drawImage.
  source: CanvasImageSource
  // Optional cleanup (close the bitmap / revoke the object URL).
  cleanup: () => void
}

function isImageFile(file: File): boolean {
  return typeof file.type === "string" && file.type.startsWith("image/")
}

// Swap the extension on the original name to .jpg, preserving the base name.
function toJpegName(name: string): string {
  const dot = name.lastIndexOf(".")
  const base = dot > 0 ? name.slice(0, dot) : name
  return `${base}.jpg`
}

// Decode the file to something we can draw on a canvas. Prefer createImageBitmap
// (fast, off-thread); fall back to an <img> + object URL when it's unavailable
// or throws. Returns null if the image can't be decoded at all.
async function decodeImage(file: File): Promise<DecodedImage | null> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file)
      return {
        width: bitmap.width,
        height: bitmap.height,
        source: bitmap,
        cleanup: () => {
          try {
            bitmap.close()
          } catch {
            // ignore
          }
        },
      }
    } catch {
      // Fall through to the <img> path (some browsers can't bitmap-decode HEIC).
    }
  }

  if (typeof document === "undefined" || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return null
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error("image decode failed"))
      element.src = objectUrl
    })
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      source: img,
      cleanup: () => {
        try {
          URL.revokeObjectURL(objectUrl)
        } catch {
          // ignore
        }
      },
    }
  } catch {
    try {
      URL.revokeObjectURL(objectUrl)
    } catch {
      // ignore
    }
    return null
  }
}

// Render the decoded image at the target size and export a JPEG blob. Uses
// OffscreenCanvas when available (keeps the main thread freer), else a DOM
// <canvas>. Returns null on any failure so the caller can fall back.
async function encodeResizedJpeg(
  image: DecodedImage,
  targetWidth: number,
  targetHeight: number,
): Promise<Blob | null> {
  // OffscreenCanvas path.
  if (typeof OffscreenCanvas === "function") {
    try {
      const canvas = new OffscreenCanvas(targetWidth, targetHeight)
      const ctx = canvas.getContext("2d")
      if (!ctx) return null
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(image.source, 0, 0, targetWidth, targetHeight)
      const blob = await canvas.convertToBlob({ type: OUTPUT_TYPE, quality: JPEG_QUALITY })
      return blob ?? null
    } catch {
      // Fall through to the DOM canvas path.
    }
  }

  if (typeof document === "undefined") return null

  try {
    const canvas = document.createElement("canvas")
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(image.source, 0, 0, targetWidth, targetHeight)
    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), OUTPUT_TYPE, JPEG_QUALITY)
    })
  } catch {
    return null
  }
}

/**
 * Shrink a large raster image in the browser before it's uploaded.
 *
 * - PDFs / non-images are returned unchanged (never downscaled).
 * - Images already within MAX_LONGEST_SIDE are returned unchanged (no upscale,
 *   no needless re-encode).
 * - Larger images are resized to a 1600px longest side and re-encoded as JPEG
 *   at quality 0.85, returned as a new File ("<base>.jpg", image/jpeg) that
 *   preserves the original lastModified.
 * - Any failure returns the ORIGINAL file. This never throws.
 */
export async function downscaleImageForUpload(file: File): Promise<File> {
  try {
    // Never touch PDFs or anything that isn't a raster image.
    if (!isImageFile(file)) return file
    if (typeof window === "undefined") return file

    const image = await decodeImage(file)
    if (!image) return file

    try {
      const { width, height } = image
      if (!width || !height) return file

      const longest = Math.max(width, height)
      // Already small enough — don't upscale, don't re-encode.
      if (longest <= MAX_LONGEST_SIDE) return file

      const scale = MAX_LONGEST_SIDE / longest
      const targetWidth = Math.max(1, Math.round(width * scale))
      const targetHeight = Math.max(1, Math.round(height * scale))

      const blob = await encodeResizedJpeg(image, targetWidth, targetHeight)
      // Guard against a degenerate/empty encode — keep the original then.
      if (!blob || blob.size === 0) return file

      return new File([blob], toJpegName(file.name), {
        type: OUTPUT_TYPE,
        lastModified: file.lastModified,
      })
    } finally {
      image.cleanup()
    }
  } catch {
    // Absolutely never block an upload on a resize failure.
    return file
  }
}

/**
 * Map a list of picked files through downscaleImageForUpload in parallel.
 * Convenience wrapper for upload call sites. Never throws — each file
 * independently falls back to its original on failure.
 */
export async function downscaleImagesForUpload(files: File[]): Promise<File[]> {
  return Promise.all(files.map((file) => downscaleImageForUpload(file)))
}
