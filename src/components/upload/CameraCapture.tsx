"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Loader2, X } from "lucide-react"

import { cn } from "@/lib/utils"

// ── Quality heuristics ─────────────────────────────────────────────────────
// Cheap, canvas-only checks — no CV library. We sample a small downscaled frame
// (SAMPLE_W × SAMPLE_H) and read its pixels once per analysis tick.
const SAMPLE_W = 160
const SAMPLE_H = 120

// Thresholds tuned for phone cameras photographing paper documents.
const DARK_BELOW = 60 //     mean luma under this ⇒ "Too dark"
const BRIGHT_ABOVE = 225 //  mean luma over this ⇒ "Too bright / glare"
const BLUR_BELOW = 7 //      sharpness score under this ⇒ "Hold steady"
const FILL_BELOW = 0.16 //   edge activity under this ⇒ "Move closer" (document too small / far)

type Cue = "dark" | "bright" | "blurry" | "far" | "ok"

type Reading = {
  cue: Cue
  /** rolling "ready" streak — consecutive OK frames, so we only flash ✓ when steady */
  steady: boolean
}

const CUE_COPY: Record<Cue, { label: string; tone: "warn" | "good" }> = {
  dark: { label: "Too dark — find better light", tone: "warn" },
  bright: { label: "Too bright — reduce glare", tone: "warn" },
  blurry: { label: "Hold steady", tone: "warn" },
  far: { label: "Move closer", tone: "warn" },
  ok: { label: "Got it", tone: "good" },
}

/**
 * Analyse one downscaled frame.
 * - brightness: mean luma (Rec. 601).
 * - sharpness:  mean absolute horizontal+vertical neighbour gradient of luma
 *   (a cheap Laplacian proxy — low for blurry / motion-smeared frames).
 * - fill:       share of pixels that sit on a strong edge, a proxy for "is a
 *   document filling enough of the frame" (a far-away doc has mostly flat
 *   background ⇒ few edges).
 */
function analyse(data: Uint8ClampedArray, w: number, h: number): Cue {
  const luma = new Float32Array(w * h)
  let sum = 0
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    luma[p] = y
    sum += y
  }
  const mean = sum / (w * h)

  if (mean < DARK_BELOW) return "dark"
  if (mean > BRIGHT_ABOVE) return "bright"

  let gradSum = 0
  let edgeCount = 0
  let samples = 0
  // Skip the outer ring so we don't index out of bounds.
  for (let yRow = 1; yRow < h - 1; yRow++) {
    for (let xCol = 1; xCol < w - 1; xCol++) {
      const idx = yRow * w + xCol
      const gx = Math.abs(luma[idx + 1] - luma[idx - 1])
      const gy = Math.abs(luma[idx + w] - luma[idx - w])
      const g = gx + gy
      gradSum += g
      if (g > 40) edgeCount++
      samples++
    }
  }
  const sharpness = gradSum / samples
  const fill = edgeCount / samples

  if (sharpness < BLUR_BELOW) return "blurry"
  if (fill < FILL_BELOW) return "far"
  return "ok"
}

type CameraCaptureProps = {
  /** Called with the captured photo as a ready-to-upload File. */
  onCapture: (file: File) => void
  /** Close without capturing. */
  onClose: () => void
  /**
   * Camera couldn't open (no API / permission denied / no device). The parent
   * should fall back to the native file/camera input instead of blocking.
   */
  onUnavailable: () => void
}

export function CameraCapture({ onCapture, onClose, onUnavailable }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyserCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const okStreakRef = useRef(0)

  const [ready, setReady] = useState(false)
  const [reading, setReading] = useState<Reading>({ cue: "far", steady: false })
  const [flash, setFlash] = useState(false)

  // ── Start / stop the camera stream ───────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function start() {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        onUnavailable()
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play().catch(() => {})
          setReady(true)
        }
      } catch {
        // Permission denied, no camera, or insecure context (non-HTTPS).
        if (!cancelled) onUnavailable()
      }
    }

    void start()

    return () => {
      cancelled = true
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Per-frame quality analysis loop ──────────────────────────────────────
  useEffect(() => {
    if (!ready) return

    if (!analyserCanvasRef.current) {
      const c = document.createElement("canvas")
      c.width = SAMPLE_W
      c.height = SAMPLE_H
      analyserCanvasRef.current = c
    }
    const ctx = analyserCanvasRef.current.getContext("2d", { willReadFrequently: true })
    let last = 0

    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick)
      // Throttle to ~6 analyses/sec — plenty responsive, easy on the battery.
      if (now - last < 160) return
      last = now
      const video = videoRef.current
      if (!ctx || !video || video.readyState < 2) return
      ctx.drawImage(video, 0, 0, SAMPLE_W, SAMPLE_H)
      let cue: Cue
      try {
        const frame = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H)
        cue = analyse(frame.data, SAMPLE_W, SAMPLE_H)
      } catch {
        return // tainted canvas — skip, capture still works
      }
      okStreakRef.current = cue === "ok" ? okStreakRef.current + 1 : 0
      const steady = okStreakRef.current >= 3
      setReading((prev) =>
        prev.cue === cue && prev.steady === steady ? prev : { cue, steady },
      )
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [ready])

  // ── Capture the full-resolution frame to a File ──────────────────────────
  const capture = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    setFlash(true)
    window.setTimeout(() => setFlash(false), 180)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" })
        onCapture(file)
      },
      "image/jpeg",
      0.92,
    )
  }, [onCapture])

  const cue = CUE_COPY[reading.cue]
  const good = reading.cue === "ok" && reading.steady

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col bg-black"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Live preview */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Shutter flash */}
      <AnimatePresence>
        {flash ? (
          <motion.div
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-30 bg-white"
          />
        ) : null}
      </AnimatePresence>

      {/* Loading state until the stream is live */}
      {!ready ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-sm font-semibold text-white/90">
          <Loader2 className="size-6 animate-spin" />
          Opening camera…
        </div>
      ) : null}

      {/* Top bar — close */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close camera"
          className="inline-flex size-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur active:scale-95"
        >
          <X className="size-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Document framing guide — animates to mint when the shot is good */}
      <div className="pointer-events-none relative z-10 flex flex-1 items-center justify-center px-7">
        <motion.div
          animate={{
            borderColor: good ? "#d1fae5" : "rgba(255,255,255,0.55)",
            boxShadow: good
              ? "0 0 0 9999px rgba(0,0,0,0.28), 0 0 24px 2px rgba(209,250,229,0.55)"
              : "0 0 0 9999px rgba(0,0,0,0.28)",
          }}
          transition={{ duration: 0.25 }}
          className="aspect-[3/4] w-full max-w-sm rounded-3xl border-2 border-dashed"
        />
      </div>

      {/* Live cue pill */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[150px] z-20 flex justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${reading.cue}-${good}`}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-lg backdrop-blur",
              good
                ? "bg-[#d1fae5] text-[#064e3b]"
                : "bg-black/55 text-white",
            )}
          >
            {good ? <Check className="size-4" strokeWidth={3} /> : null}
            {good ? "Got it" : cue.label}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Shutter */}
      <div className="relative z-20 flex items-center justify-center px-6 pb-8 pt-2">
        <motion.button
          type="button"
          onClick={capture}
          disabled={!ready}
          aria-label="Take photo"
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: good
              ? "0 0 0 4px rgba(0,0,0,0.35), 0 0 0 7px #d1fae5"
              : "0 0 0 4px rgba(0,0,0,0.35), 0 0 0 7px rgba(255,255,255,0.85)",
          }}
          transition={{ duration: 0.25 }}
          className="inline-flex size-[72px] items-center justify-center rounded-full disabled:opacity-50"
        >
          <motion.span
            animate={{ backgroundColor: good ? "#d1fae5" : "#ffffff" }}
            transition={{ duration: 0.25 }}
            className="block size-[58px] rounded-full"
          />
        </motion.button>
      </div>
    </motion.div>
  )
}
