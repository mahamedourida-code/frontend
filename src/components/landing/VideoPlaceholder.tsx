"use client"

import { cn } from "@/lib/utils"

type VideoPlaceholderProps = {
  caption?: string
  className?: string
}

export function VideoPlaceholder({ caption, className }: VideoPlaceholderProps) {
  return (
    <div className={cn("group", className)}>
      {/* Frame */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        {/* Dot-grid texture */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--primary)) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Play circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "flex size-[56px] items-center justify-center rounded-full",
              "border-2 border-primary/50 bg-background/75 shadow-sm backdrop-blur-sm",
              "transition-[transform,border-color,box-shadow]",
              "duration-[180ms] ease-[var(--ax-motion-ease)]",
              "group-hover:scale-[1.08] group-hover:border-primary group-hover:shadow-[0_0_0_6px_hsl(var(--primary)/0.08)]",
            )}
          >
            {/* Filled triangle — not lucide Play */}
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              className="ml-0.5 size-5 text-primary"
              aria-hidden
            >
              <path d="M3 2.25 14.5 8 3 13.75V2.25Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Caption */}
      {caption && (
        <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
          {caption}
        </p>
      )}
    </div>
  )
}
