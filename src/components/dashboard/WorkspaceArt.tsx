import { cn } from "@/lib/utils"

/**
 * Renders a workspace caricature from `/public/workspace-art/<name>.webp` — raw
 * and transparent, no frame/tile/shadow. Size is controlled entirely by the
 * caller's className (e.g. `h-36 w-auto` or `size-14`). Decorative by default;
 * pass `alt` when the art carries meaning a screen reader should hear.
 */
export function WorkspaceArt({
  name,
  alt,
  className,
}: {
  name: string
  alt?: string
  className?: string
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/workspace-art/${name}.webp`}
      alt={alt ?? ""}
      aria-hidden={alt ? undefined : true}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn("pointer-events-none select-none object-contain", className)}
    />
  )
}
