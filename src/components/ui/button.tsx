import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "ax-interactive inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold shadow-none transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-2 border-black bg-white text-black hover:bg-black hover:text-white",
        critical:
          "border-2 border-[var(--brand-brown-dark)] bg-[var(--brand-brown-dark)] text-white hover:border-black hover:bg-white hover:text-black hover:underline hover:decoration-1 hover:underline-offset-4",
        // Primary CTA - landing sign-up treatment.
        glossy:
          "border-2 border-[var(--brand-brown-dark)] bg-[var(--brand-brown-dark)] text-white hover:border-black hover:bg-white hover:text-black hover:underline hover:decoration-1 hover:underline-offset-4",
        // Warm supporting action - same brown treatment.
        warm:
          "border-2 border-[var(--brand-brown-dark)] bg-[var(--brand-brown-dark)] text-white hover:border-black hover:bg-white hover:text-black hover:underline hover:decoration-1 hover:underline-offset-4",
        // Clay/lime compatibility aliases keep the brown CTA treatment.
        clay:
          "border-2 border-[var(--brand-brown-dark)] bg-[var(--brand-brown-dark)] text-white hover:border-black hover:bg-white hover:text-black hover:underline hover:decoration-1 hover:underline-offset-4",
        // High-contrast CTA, shadowless.
        ink:
          "border-2 border-black bg-black text-white hover:bg-white hover:text-black hover:underline hover:decoration-1 hover:underline-offset-4",
        // Upgrade compatibility alias.
        lime:
          "border-2 border-[var(--brand-brown-dark)] bg-[var(--brand-brown-dark)] text-white hover:border-black hover:bg-white hover:text-black hover:underline hover:decoration-1 hover:underline-offset-4",
        // Confirm/reviewed action - same ink treatment as `ink`.
        reviewed:
          "border-2 border-black bg-black text-white hover:bg-white hover:text-black hover:underline hover:decoration-1 hover:underline-offset-4",
        // Normal surface button - landing "Talk to us" treatment.
        surface:
          "border-2 border-black bg-white text-black hover:bg-black hover:text-white",
        destructive:
          "border-2 border-destructive bg-destructive text-white hover:bg-white hover:text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        // Outlined danger — white bg, red border + label, fills red on hover (Danger zone).
        dangerOutline:
          "border-2 border-red-300 bg-white text-red-600 hover:border-red-600 hover:bg-red-600 hover:text-white",
        outline:
          "border-2 border-black bg-white text-black hover:bg-black hover:text-white",
        secondary:
          "border-2 border-[var(--brand-brown-dark)] bg-[var(--brand-brown-dark)] text-white hover:border-black hover:bg-white hover:text-black hover:underline hover:decoration-1 hover:underline-offset-4",
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
