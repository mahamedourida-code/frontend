import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "ax-interactive inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border border-border bg-card text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground active:translate-y-px",
        critical:
          "bg-[var(--brand-green)] text-[var(--brand-green-fg)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_0_1px_var(--brand-green-ring),0_1px_3px_0_rgba(0,0,0,0.12)] hover:bg-[var(--brand-green-hover)] active:translate-y-px",
        // Primary green CTA — the soft mint section-background green, given
        // definition by an emerald ring + inset highlight + soft shadow (Tella).
        glossy:
          "bg-[var(--brand-green)] text-[var(--brand-green-fg)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_0_1px_var(--brand-green-ring),0_1px_3px_0_rgba(0,0,0,0.12)] hover:bg-[var(--brand-green-hover)] active:translate-y-px",
        // Black/ink CTA — high-contrast solid with Tella-style definition
        // (inset top highlight + layered drop shadow).
        ink:
          "border border-foreground/80 bg-foreground bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_88%,#fff)_0%,var(--foreground)_70%)] text-background shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_1px_2px_0_rgba(0,0,0,0.25),0_2px_6px_-1px_rgba(0,0,0,0.2)] hover:brightness-110 active:translate-y-px",
        // Upgrade — uses the dedicated buto.png artwork (glossy pill) with white text.
        lime:
          "border-0 bg-transparent bg-[url('/buto.png')] bg-[length:100%_100%] bg-center bg-no-repeat text-white font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)] hover:brightness-[1.06] active:translate-y-px",
        // Confirm/reviewed action — same ink treatment as `ink`.
        reviewed:
          "border border-foreground/80 bg-foreground bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_86%,#fff)_0%,var(--foreground)_72%)] text-background shadow-[0_1px_2px_rgba(0,0,0,0.18)] hover:brightness-110 active:translate-y-px",
        // Neutral secondary surface button.
        surface:
          "border border-border bg-card text-foreground shadow-[0_1px_1px_rgba(0,0,0,0.03)] hover:bg-accent hover:text-accent-foreground active:translate-y-px",
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
