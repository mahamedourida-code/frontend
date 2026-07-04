import Image from "next/image"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { workspaceVisuals, type WorkspaceVisualName } from "@/components/dashboard/workspace-visuals"

export type { WorkspaceVisualName } from "@/components/dashboard/workspace-visuals"

type WorkspaceVisualImageProps = {
  visual: WorkspaceVisualName
  alt?: string
  priority?: boolean
  sizes?: string
  className?: string
  imageClassName?: string
}

export function WorkspaceVisualImage({
  visual,
  alt = "",
  priority = false,
  sizes = "(min-width: 1280px) 320px, (min-width: 768px) 33vw, 88vw",
  className,
  imageClassName,
}: WorkspaceVisualImageProps) {
  const image = workspaceVisuals[visual]

  return (
    <span
      className={cn(
        "relative block aspect-[16/10] w-full overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--workspace-border)_62%,transparent)] bg-[var(--workspace-soft)] shadow-[0_18px_42px_-30px_rgba(15,23,42,0.46)]",
        className,
      )}
    >
      <Image
        src={image.src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        aria-hidden={alt ? undefined : true}
        className={cn("object-cover", imageClassName)}
      />
      <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/40" />
    </span>
  )
}

type WorkspaceVisualCardProps = {
  visual: WorkspaceVisualName
  title?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  action?: ReactNode
  children?: ReactNode
  compact?: boolean
  priority?: boolean
  className?: string
  mediaClassName?: string
  imageClassName?: string
  contentClassName?: string
}

export function WorkspaceVisualCard({
  visual,
  title,
  description,
  eyebrow,
  action,
  children,
  compact = false,
  priority = false,
  className,
  mediaClassName,
  imageClassName,
  contentClassName,
}: WorkspaceVisualCardProps) {
  const hasContent = Boolean(eyebrow || title || description || action || children)

  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--workspace-border)_62%,transparent)] bg-white shadow-[0_20px_48px_-36px_rgba(15,23,42,0.58)] transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--workspace-primary)_28%,var(--workspace-border))] hover:shadow-[0_24px_54px_-38px_rgba(15,23,42,0.66)] focus-within:ring-2 focus-within:ring-[var(--workspace-primary)]/20",
        className,
      )}
    >
      <WorkspaceVisualImage
        visual={visual}
        priority={priority}
        className={cn("rounded-none border-0 shadow-none", compact ? "aspect-[4/3]" : "aspect-[16/10]", mediaClassName)}
        imageClassName={cn(
          "transition-transform duration-300 ease-out group-hover:scale-[1.025]",
          imageClassName,
        )}
      />
      {hasContent ? (
        <div className={cn("flex flex-1 flex-col", compact ? "p-3" : "p-4", contentClassName)}>
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--workspace-muted)]">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h3 className={cn("font-semibold tracking-normal text-foreground", compact ? "mt-1 text-[14px]" : "mt-1.5 text-[15px]")}>
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className={cn("mt-1.5 text-pretty text-[12px] font-medium leading-5 text-[var(--workspace-muted)]", compact && "leading-4")}>
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-3">{children}</div> : null}
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      ) : null}
    </article>
  )
}
