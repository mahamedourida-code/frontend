import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "ax-interactive inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border border-[var(--button-surface-ring)] bg-[var(--button-surface)] text-[var(--button-ink)] shadow-sm hover:bg-[var(--button-surface-hover)] active:translate-y-px",
        critical:
          "border-2 border-[var(--brand-green)] bg-[var(--brand-green)] text-[var(--brand-green-fg)] shadow-sm transition-colors hover:bg-transparent hover:text-[var(--brand-green)] active:translate-y-px",
        // Primary green CTA — the soft mint section-background green, given
        // definition by an emerald ring + inset highlight + soft shadow (Tella).
        glossy:
          "border-2 border-[var(--brand-green)] bg-[var(--brand-green)] text-[var(--brand-green-fg)] shadow-sm transition-colors hover:bg-transparent hover:text-[var(--brand-green)] active:translate-y-px",
        // Warm supporting action — lifted from the landing mega-menu panel,
        // with a brown definition ring and dark ink label.
        warm:
          "border border-[var(--button-warm-ring)] bg-[var(--button-warm)] text-[var(--button-ink)] shadow-sm hover:bg-[var(--button-warm-hover)] active:translate-y-px",
        // Light clay special action — quieter than mint, with a warm ring and
        // dark ink label. Reserved for actions such as Upgrade.
        clay:
          "bg-[var(--brand-clay)] text-[var(--brand-clay-fg)] shadow-sm hover:bg-[var(--brand-clay-hover)] active:translate-y-px",
        // Black/ink CTA — high-contrast solid with Tella-style definition
        // (inset top highlight + layered drop shadow).
        ink:
          "bg-foreground text-background shadow-sm hover:opacity-90 active:translate-y-px",
        // Upgrade compatibility alias — keep existing callers on `lime` while the
        // visual treatment moves to the accountant-shell clay pill.
        lime:
          "bg-[var(--brand-clay)] text-[var(--brand-clay-fg)] shadow-sm hover:bg-[var(--brand-clay-hover)] active:translate-y-px",
        // Confirm/reviewed action — same ink treatment as `ink`.
        reviewed:
          "bg-foreground text-background shadow-sm hover:opacity-90 active:translate-y-px",
        // Neutral secondary surface button.
        surface:
          "border border-[var(--button-surface-ring)] bg-[var(--button-surface)] text-[var(--button-ink)] shadow-sm hover:bg-[var(--button-surface-hover)] active:translate-y-px",
        destructive:
          "bg-destructive text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:brightness-95 active:translate-y-px focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // One pill shape across all sizes — only height & horizontal padding scale,
      // keeping the same proportions (Tella/Proposify rule).
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
