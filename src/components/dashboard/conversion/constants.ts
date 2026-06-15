export const workspacePrimaryControlClass =
  "rounded-full border border-[#A98467] bg-[#A98467] text-white shadow-none hover:border-[#8a6a52] hover:bg-[#8a6a52] focus-visible:ring-[#A98467]/30"
export const workspaceNormalControlClass =
  "rounded-full border border-[var(--workspace-button-border)] bg-white text-[var(--workspace-ink)] shadow-none hover:border-[var(--workspace-primary)] hover:bg-[var(--workspace-blue-soft)] hover:text-[var(--workspace-primary)] focus-visible:ring-[var(--workspace-primary)]/20"
export const workspacePanelSurfaceClass =
  "border-[var(--workspace-border)] bg-[var(--workspace-soft)]"

/**
 * C14 — scale review depth by stakes. Invoices whose total lands at/above this
 * amount auto-expand with full source evidence and a soft "high value" cue,
 * even when they're otherwise clean; smaller clean ones still collapse to a
 * one-line confirm (C4). Pure presentation over the already-extracted total —
 * no new model, no backend call. Edit this single constant to retune the bar.
 * (Radiology: more depth when the stakes are higher.)
 */
export const HIGH_VALUE_THRESHOLD = 5000
