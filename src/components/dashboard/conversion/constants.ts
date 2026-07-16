export const workspacePrimaryControlClass =
  "rounded-lg shadow-none focus-visible:ring-[var(--workspace-primary)]/30"
export const workspaceNormalControlClass =
  "rounded-lg border border-[var(--workspace-button-border)] bg-white text-[var(--workspace-ink)] shadow-none hover:border-[var(--workspace-primary)] hover:bg-[var(--workspace-blue-soft)] hover:text-[var(--workspace-primary)] focus-visible:ring-[var(--workspace-primary)]/20"
export const workspacePanelSurfaceClass =
  "rounded-lg border-[var(--workspace-border)] bg-white shadow-none"
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
