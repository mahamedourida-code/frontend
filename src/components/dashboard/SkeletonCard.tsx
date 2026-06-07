import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/* ── SkeletonStatCard ─────────────────────────────────────────
   Drop-in placeholder for a single metric/stat card while the
   dashboard payload is loading. Two shimmer lines: a tall value
   bar and a thinner helper line. */
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <Card className={cn("min-h-[120px]", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-4 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  )
}

/* ── SkeletonTableRow ──────────────────────────────────────────
   Drop-in placeholder for a table row. Mirrors the h-12 row chrome
   used by the history + queue tables and renders three shimmer
   segments that approximate filename / date / status / actions. */
type SkeletonTableRowProps = {
  columns?: number
  className?: string
}

export function SkeletonTableRow({ columns = 6, className }: SkeletonTableRowProps) {
  const segments = Math.max(3, columns - 1)
  return (
    <TableRow className={cn("h-12", className)}>
      <TableCell className="w-10 py-2">
        <Skeleton className="size-10 rounded-lg" />
      </TableCell>
      {Array.from({ length: segments }).map((_, index) => {
        const widthScale = [220, 110, 80, 60, 96][index] ?? 90
        return (
          <TableCell key={index} className="py-2">
            <Skeleton className="h-3.5" style={{ width: widthScale }} />
          </TableCell>
        )
      })}
    </TableRow>
  )
}

/* ── SkeletonDocumentCard ──────────────────────────────────────
   Drop-in placeholder for a review-board document tile. 160×200
   card with a large image area and two short text shimmers. */
export function SkeletonDocumentCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-[200px] w-[160px] flex-col gap-2 rounded-md border border-border bg-card p-2 shadow-none",
        className,
      )}
    >
      <Skeleton className="h-[120px] w-full rounded-sm" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}
