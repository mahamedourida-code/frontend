import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * Two real button styles, token-driven so they flip by context:
 *   PRIMARY   — filled. Black on the marketing site, Facebook-blue in the
 *               workspace. Background darkens on hover.
 *   SECONDARY — white with a THIN black border on the site (inverts to black +
 *               white text on hover); a filled black button in the workspace.
 * Shape is a soft rounded-rectangle (rounded-lg), not a pill. Everything else
 * (danger, ghost, link) is left as-is — text-only / functional.
 * The site/workspace values live in globals.css (`--btn-*`).
 */
const BTN_PRIMARY =
  "border border-[var(--btn-primary-border)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-bg-hover)] hover:text-[var(--btn-primary-fg-hover)] hover:border-[var(--btn-primary-border-hover)]"

const BTN_SECONDARY =
  "border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)] hover:bg-[var(--btn-secondary-bg-hover)] hover:text-[var(--btn-secondary-fg-hover)]"

const buttonVariants = cva(
  "ax-interactive inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[15px] font-medium shadow-none transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // SECONDARY group — white thin-border on the site, black in workspace.
        default: BTN_SECONDARY,
        surface: BTN_SECONDARY,
        outline: BTN_SECONDARY,
        secondary: BTN_SECONDARY,
        // PRIMARY group — black on the site, Facebook-blue in workspace.
        critical: BTN_PRIMARY,
        glossy: BTN_PRIMARY,
        warm: BTN_PRIMARY,
        clay: BTN_PRIMARY,
        ink: BTN_PRIMARY,
        lime: BTN_PRIMARY,
        reviewed: BTN_PRIMARY,
        // Facebook-blue CTA (marketing nav auth) — inverts to white on hover.
        blue:
          "border border-[var(--workspace-blue)] bg-white text-[var(--workspace-blue)] hover:bg-[var(--workspace-blue)] hover:text-white",
        // Smart / vendor-memory accent — outline purple that fills on hover.
        purple:
          "border border-[var(--workspace-purple)] bg-white text-[var(--workspace-purple)] hover:bg-[var(--workspace-purple)] hover:text-white",
        // Danger — kept red.
        destructive:
          "border border-destructive bg-destructive text-white hover:bg-white hover:text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        dangerOutline:
          "border border-red-300 bg-white text-red-600 hover:border-red-600 hover:bg-red-600 hover:text-white",
        // Text-only buttons — kept.
        ghost:
          "bg-transparent text-black hover:bg-transparent hover:text-black",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 px-7 text-[15px] has-[>svg]:px-5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref as React.Ref<HTMLButtonElement>}
        data-slot="button"
        data-variant={variant || "default"}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
export type { ButtonProps }
