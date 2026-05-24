import { cn } from "@/lib/utils"

type DashboardSpinnerProps = {
  className?: string
  label?: string
}

export function DashboardSpinner({
  className,
  label = "Loading",
}: DashboardSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block size-10 rounded-full border-[3px] border-foreground/16 border-t-foreground motion-safe:animate-spin",
        className
      )}
    />
  )
}

export function DashboardRouteLoader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <DashboardSpinner className="size-11 border-[4px]" label={label} />
    </div>
  )
}
