import type { StatusTone } from "@/components/dashboard/StatusBadge"

/**
 * One bookkeeper-facing lifecycle shared by both review surfaces — the
 * workspace "Verify extraction" board and the "Draft bills" (AP) queue.
 *
 * The two pages historically spoke different vocabularies (workspace:
 * needs_review/ready/edited/published/failed/deleted; AP:
 * needs_coding/needs_review/ready_to_publish/published/failed/discarded).
 * That made the product feel like two tools. Map both onto the small set a
 * bookkeeper actually thinks in so labels, tones, and counts read the same
 * everywhere.
 */
export type ReviewStage = "needs_you" | "ready" | "published" | "failed" | "discarded"

export const REVIEW_STAGE_LABEL: Record<ReviewStage, string> = {
  needs_you: "Needs you",
  ready: "Ready",
  published: "Published",
  failed: "Failed",
  discarded: "Discarded",
}

export const REVIEW_STAGE_TONE: Record<ReviewStage, StatusTone> = {
  needs_you: "warning",
  ready: "success",
  published: "info",
  failed: "error",
  discarded: "neutral",
}

/** Workspace `review_status` (and raw job status) → unified stage. */
export function workspaceStage(status?: string | null): ReviewStage {
  switch (status) {
    case "ready":
      return "ready"
    case "published":
      return "published"
    case "failed":
      return "failed"
    case "deleted":
      return "discarded"
    case "needs_review":
    case "edited":
    default:
      return "needs_you"
  }
}

/** Accounts-payable `status` → unified stage. */
export function apStage(status?: string | null): ReviewStage {
  switch (status) {
    case "ready_to_publish":
      return "ready"
    case "published":
      return "published"
    case "failed":
      return "failed"
    case "discarded":
      return "discarded"
    case "needs_coding":
    case "needs_review":
    default:
      return "needs_you"
  }
}

export function stageLabel(stage: ReviewStage): string {
  return REVIEW_STAGE_LABEL[stage]
}

export function stageTone(stage: ReviewStage): StatusTone {
  return REVIEW_STAGE_TONE[stage]
}

/**
 * Bookkeeper field labels used across both surfaces so the workspace stops
 * saying generic things like "identity / amount" and instead speaks the same
 * Net / VAT / Total / Supplier language as the AP queue.
 */
export const FIELD_LABEL = {
  supplier: "Supplier",
  billNumber: "Bill no.",
  invoiceDate: "Invoice date",
  dueDate: "Due",
  account: "Account",
  vatCode: "VAT code",
  net: "Net",
  vat: "VAT",
  gross: "Total",
  currency: "Currency",
} as const

export type FieldLabelKey = keyof typeof FIELD_LABEL
