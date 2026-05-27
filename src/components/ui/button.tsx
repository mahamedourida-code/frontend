import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "ax-interactive inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border border-border bg-card text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground",
        critical: "bg-primary text-primary-foreground hover:bg-primary/90",
        glossy:
          "border-0 bg-transparent bg-[url('/generated_buttons/actions/primary.png')] bg-[length:100%_100%] bg-center bg-no-repeat text-white drop-shadow-[0_2px_3px_rgba(7,151,101,0.2)] hover:brightness-[1.04]",
        ink:
          "border-0 bg-transparent bg-[url('/generated_buttons/actions/ink.png')] bg-[length:100%_100%] bg-center bg-no-repeat text-white drop-shadow-[0_2px_3px_rgba(15,23,42,0.22)] hover:brightness-110",
        lime:
          "border-0 bg-transparent bg-[url('/generated_buttons/actions/upgrade.png')] bg-[length:100%_100%] bg-center bg-no-repeat text-[#111b16] drop-shadow-[0_2px_3px_rgba(80,108,22,0.14)] hover:brightness-[1.03]",
        reviewed:
          "border-0 bg-transparent bg-[url('/generated_buttons/actions/reviewed.png')] bg-[length:100%_100%] bg-center bg-no-repeat text-white drop-shadow-[0_2px_3px_rgba(15,23,42,0.22)] hover:brightness-110",
        surface:
          "border-0 bg-card bg-[url('/generated_buttons/actions/secondary.png')] bg-[length:100%_100%] bg-center bg-no-repeat text-foreground drop-shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:brightness-[0.985]",
        destructive:
          "border-0 bg-transparent bg-[url('/generated_buttons/actions/danger.png')] bg-[length:100%_100%] bg-center bg-no-repeat text-white drop-shadow-[0_2px_3px_rgba(202,50,20,0.2)] hover:brightness-[0.97] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
