import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

type BrandVisualTreatment = "photo" | "product" | "document" | "cutout"

type BrandVisualFrameProps = HTMLAttributes<HTMLDivElement> & {
  treatment?: BrandVisualTreatment
  children?: ReactNode
}

export function BrandVisualFrame({
  treatment = "photo",
  className,
  children,
  ...props
}: BrandVisualFrameProps) {
  return (
    <div
      data-treatment={treatment}
      className={cn("ax-visual-frame", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function BrandSectionLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("ax-section-label", className)}>{children}</div>
}
