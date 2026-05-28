/**
 * Helpers for the "Handwritten specialist" positioning. The backend does
 * not currently expose a discrete `handwritten` document_mode or per-cell
 * confidence scores, so these predicates are forward-compatible:
 *
 * - `isHandwrittenDocument` reads multiple optional metadata signals and
 *   defaults to `document_mode === "notes"` (the only mode that is always
 *   handwritten in the current product flow). When backend adds a real
 *   `is_handwritten` flag or `extraction_method`, the predicate picks it
 *   up automatically.
 *
 * - Confidence tiers map a 0–1 score to "low" / "medium" / "high".
 *   `getRowConfidenceTier` currently falls back to the document-level
 *   score for every row; if/when the backend returns per-cell confidence,
 *   it can be threaded through here without changing call sites.
 */

import type { ProcessedFile } from "@/lib/api-client"

export type ConfidenceTier = "high" | "medium" | "low"

/** Loose shape — we only care about a few optional fields. */
type HandwrittenCandidate =
  | (Partial<ProcessedFile> & {
      metadata?: Record<string, unknown> | null
      extraction_method?: string | null
    })
  | null
  | undefined

function readMetadataFlag(metadata: Record<string, unknown> | null | undefined, key: string) {
  if (!metadata) return undefined
  const value = metadata[key]
  if (typeof value === "boolean") return value
  if (typeof value === "string") return value.toLowerCase() === "true" || value.toLowerCase() === "handwritten"
  return undefined
}

export function isHandwrittenDocument(file: HandwrittenCandidate): boolean {
  if (!file) return false

  // Top-level backend flag (P1 — populated by simple_batch.py).
  if (typeof file.is_handwritten === "boolean") return file.is_handwritten

  // Metadata-level overrides (forward-compatible).
  const explicit =
    readMetadataFlag(file.metadata ?? undefined, "is_handwritten") ??
    readMetadataFlag(file.metadata ?? undefined, "handwritten")
  if (typeof explicit === "boolean") return explicit

  if (typeof file.extraction_method === "string") {
    const method = file.extraction_method.toLowerCase()
    if (method.includes("handwritten") || method.includes("hand_written")) return true
  }

  // Review flags can carry a typed signal.
  if (Array.isArray(file.review_flags)) {
    for (const flag of file.review_flags) {
      if (!flag || typeof flag !== "object") continue
      const type = (flag as Record<string, unknown>)["type"]
      if (typeof type === "string" && type.toLowerCase().includes("handwritten")) return true
    }
  }

  // Notes mode in the current product flow is always handwritten capture.
  if (file.document_mode === "notes") return true

  return false
}

export function getConfidenceTier(score: number | null | undefined): ConfidenceTier | null {
  if (score === null || score === undefined || Number.isNaN(score)) return null
  // Accept both 0–1 and 0–100 inputs.
  const normalized = score > 1 ? score / 100 : score
  if (normalized < 0.7) return "low"
  if (normalized < 0.88) return "medium"
  return "high"
}

/**
 * Per-row confidence tier. Reads the backend-supplied `row_confidence` array
 * when present (populated for handwritten docs by simple_batch.py), and falls
 * back to the document-level score when the row index is out of range or no
 * per-row signal exists.
 *
 * NOTE: the comparison table renders a header row at `rowIndex === 0`. The
 * data row at `rowIndex === N` therefore maps to `row_confidence[N - 1]`.
 */
export function getRowConfidenceTier(
  file: HandwrittenCandidate,
  rowIndex: number,
): ConfidenceTier | null {
  if (!file) return null

  const rowScores = (file as { row_confidence?: number[] }).row_confidence
  if (Array.isArray(rowScores) && rowScores.length) {
    const dataIndex = rowIndex - 1 // header row offset
    if (dataIndex >= 0 && dataIndex < rowScores.length) {
      const tier = getConfidenceTier(rowScores[dataIndex])
      if (tier) return tier
    }
  }

  const score =
    typeof (file as any).confidence_score === "number"
      ? (file as any).confidence_score
      : typeof (file as any).confidence === "number"
        ? (file as any).confidence
        : null
  return getConfidenceTier(score)
}

export const CONFIDENCE_TIER_LABEL: Record<ConfidenceTier, string> = {
  high: "High confidence",
  medium: "Medium confidence — review recommended",
  low: "Low confidence — verify before use",
}
