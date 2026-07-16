import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Marketing and workspace buttons share variants while their visual recipes
// remain context-driven through tokens in globals.css.
const BTN_PRIMARY =
  "border border-[var(--btn-primary-border)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_1px_2px_0_rgba(16,24,40,0.08),0_1px_3px_0_rgba(16,24,40,0.08)] hover:border-[var(--btn-primary-border-hover)] hover:bg-[var(--btn-primary-bg-hover)] hover:text-[var(--btn-primary-fg-hover)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_2px_4px_0_rgba(16,24,40,0.09)] active:translate-y-0 active:shadow-[inset_0_1px_2px_0_rgba(16,24,40,0.12),0_1px_1px_0_rgba(16,24,40,0.05)]"

const BTN_SECONDARY =
  "border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)] hover:border-[var(--btn-secondary-border-hover)] hover:bg-[var(--btn-secondary-bg-hover)] hover:text-[var(--btn-secondary-fg-hover)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.75),0_1px_2px_0_rgba(16,24,40,0.05),0_1px_3px_0_rgba(16,24,40,0.09)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_4px_0_rgba(16,24,40,0.07),0_4px_10px_-2px_rgba(16,24,40,0.12)] hover:-translate-y-px active:translate-y-0 active:shadow-[inset_0_1px_2px_0_rgba(16,24,40,0.08),0_1px_1px_0_rgba(16,24,40,0.05)]"

const BTN_BLUE =
  "border border-[var(--btn-blue-border)] bg-[var(--btn-blue-bg)] text-[var(--btn-blue-fg)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.24),0_0_0_1px_var(--btn-blue-border),0_2px_4px_0_rgba(15,23,42,0.18)] hover:border-[var(--btn-blue-border-hover)] hover:bg-[var(--btn-blue-bg-hover)] hover:text-[var(--btn-blue-fg)] active:translate-y-px active:bg-[var(--btn-blue-bg-active)] active:shadow-[inset_0_2px_3px_0_rgba(15,23,42,0.24),0_0_0_1px_var(--btn-blue-border-active)]"

const buttonVariants = cva(
  "ax-interactive inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full text-[15px] font-medium shadow-none transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-[var(--ax-motion-fast)] ease-[var(--ax-motion-ease)] active:scale-[0.97] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: BTN_SECONDARY,
        surface: BTN_SECONDARY,
        outline: BTN_SECONDARY,
        secondary: BTN_SECONDARY,
        critical: BTN_PRIMARY,
        glossy: BTN_PRIMARY,
        warm: BTN_PRIMARY,
        clay: BTN_PRIMARY,
        ink: BTN_PRIMARY,
        lime: BTN_PRIMARY,
        reviewed: BTN_PRIMARY,
        blue: BTN_BLUE,
        purple:
          "border border-[var(--workspace-purple)] bg-white text-[var(--workspace-purple)] hover:bg-[var(--workspace-purple)] hover:text-white",
        destructive:
          "border border-destructive bg-destructive text-white hover:bg-white hover:text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        dangerOutline:
          "border border-red-300 bg-white text-red-600 hover:border-red-600 hover:bg-red-600 hover:text-white",
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
  },
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
        data-size={size || "default"}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
export type { ButtonProps }
