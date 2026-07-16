export const workspacePrimaryControlClass =
  "rounded-full focus-visible:ring-[var(--brand-green-ring)]/30"
export const workspaceNormalControlClass =
  "rounded-full border border-[var(--workspace-button-border)] bg-white text-[var(--workspace-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_1px_1px_0_rgba(16,24,40,0.04)] hover:border-[var(--workspace-primary)] hover:bg-[var(--workspace-blue-soft)] hover:text-[var(--workspace-primary)] focus-visible:ring-[var(--workspace-primary)]/20"
export const workspacePanelSurfaceClass =
  "rounded-lg border-[var(--workspace-border)] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]"
export const workspaceSoftPanelSurfaceClass =
  "rounded-lg border-[var(--workspace-border)] bg-[var(--workspace-soft)] shadow-none"

/**
 * C14: scale review depth by stakes. Invoices whose total lands at/above this
 * amount auto-expand with full source evidence and a soft "high value" cue,
 * even when they're otherwise clean; smaller clean ones still collapse to a
 * one-line confirm (C4). Pure presentation over the already-extracted total;
 * no new model, no backend call. Edit this single constant to retune the bar.
 * (Radiology: more depth when the stakes are higher.)
 */
export const HIGH_VALUE_THRESHOLD = 5000
