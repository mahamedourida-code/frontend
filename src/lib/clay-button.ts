/**
 * Clay — the warm brown secondary-action treatment for dashboard pages.
 *
 * The brand owns ONE mint-green `glossy` primary per view; supporting forward
 * verbs (Save draft, Add reviewer, Create link, secondary connects) use this
 * warm clay pill so they read as deliberate, lower-priority actions without
 * competing with the single green CTA. Black label, warm `#8a6d4b` fill, and a
 * Tella-style "definition" recipe (inset highlight + clay ring + soft shadow)
 * mirroring the `warm` variant in `button.tsx`.
 *
 * Applied as a className override on `variant="surface"` so it inherits the pill
 * shape, sizing, and transition while swapping only the colour treatment. This
 * lives here (not in `button.tsx`) so the page pass stays self-contained.
 */
export const clayButton =
  "border-transparent bg-[#8a6d4b] text-black " +
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_0_0_1px_rgba(112,87,57,0.9),0_1px_3px_0_rgba(64,44,20,0.24)] " +
  "hover:bg-[#7a5f40] hover:text-black active:translate-y-px"
