"use client"

import * as React from "react"
import { useReducedMotion } from "framer-motion"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

/**
 * Layout-matching skeleton loaders for the workspace's main tables.
 *
 * Ghost cells reuse the existing shimmer: the `ax-skeleton` class supplies the
 * `shimmer` animation from globals.css, while a valid gradient is layered via
 * inline `backgroundImage` (the class's own `hsl(var(--muted))` resolves to an
 * invalid double-`hsl()` and paints nothing). Nothing is added to globals.css.
 *
 * Under `useReducedMotion()` each ghost renders as a flat muted block with the
 * animation disabled — no shimmer.
 *
 * `SkeletonTable` renders a complete `ax-table` (static header + N ghost rows)
 * so swapping skeleton → data is seamless with no layout shift. `SkeletonRows`
 * exposes just the body rows for tables that already render their own header
 * (e.g. a TanStack table). `SkeletonList` mirrors the calm row-list used by the
 * batches queue.
 */

const SHIMMER_IMAGE =
  "linear-gradient(90deg, var(--muted) 0%, var(--accent) 50%, var(--muted) 100%)"

type GhostVariant =
  | "text"
  | "pill"
  | "avatar"
  | "thumbnail"
  | "iconlg"
  | "iconbtn"
  | "checkbox"
  | "badge"

const GHOST_SIZING: Record<GhostVariant, string> = {
  text: "h-3.5 rounded-md",
  pill: "h-8 rounded-full",
  avatar: "size-8 rounded-md",
  thumbnail: "size-10 rounded-lg",
  iconlg: "size-9 rounded-lg",
  iconbtn: "size-8 rounded-md",
  checkbox: "size-4 rounded-[4px]",
  badge: "h-5 w-16 rounded-full",
}

function Ghost({
  variant = "text",
  width,
  reduce,
  className,
}: {
  variant?: GhostVariant
  width?: number | string
  reduce: boolean
  className?: string
}) {
  const style: React.CSSProperties = reduce
    ? { backgroundColor: "var(--muted)", animation: "none" }
    : {
        backgroundImage: SHIMMER_IMAGE,
        backgroundSize: "1000px 100%",
        backgroundRepeat: "no-repeat",
      }

  if (variant === "text" || variant === "pill") {
    style.width = width ?? (variant === "pill" ? 88 : 80)
  }

  return (
    <span
      aria-hidden="true"
      className={cn("ax-skeleton block shrink-0", GHOST_SIZING[variant], className)}
      style={style}
    />
  )
}

type ColumnShape =
  | "text"
  | "entity"
  | "badge"
  | "checkbox"
  | "thumbnail"
  | "pill"
  | "actions"

export type SkeletonColumn = {
  /** Static header label, mirrored from the real table so the swap is seamless. */
  header?: React.ReactNode
  /** Ghost shape rendered in the body cells. Defaults to "text". */
  shape?: ColumnShape
  /** Ghost width for "text"/"entity"/"pill" shapes (px number or CSS length). */
  width?: number | string
  /** Cell alignment — mirror the real column. Defaults to "left". */
  align?: "left" | "right" | "center"
  /** Extra classes applied to BOTH the header and body cell (padding/min-width). */
  className?: string
}

function GhostCell({
  shape = "text",
  width,
  reduce,
}: {
  shape?: ColumnShape
  width?: number | string
  reduce: boolean
}) {
  switch (shape) {
    case "entity":
      return (
        <span className="flex min-w-0 items-center gap-3">
          <Ghost variant="avatar" reduce={reduce} />
          <Ghost variant="text" width={width ?? 140} reduce={reduce} />
        </span>
      )
    case "actions":
      return (
        <span className="flex items-center gap-1">
          <Ghost variant="iconbtn" reduce={reduce} />
          <Ghost variant="iconbtn" reduce={reduce} />
        </span>
      )
    case "badge":
      return <Ghost variant="badge" reduce={reduce} />
    case "checkbox":
      return <Ghost variant="checkbox" reduce={reduce} />
    case "thumbnail":
      return <Ghost variant="thumbnail" reduce={reduce} />
    case "pill":
      return <Ghost variant="pill" width={width} reduce={reduce} />
    case "text":
    default:
      return <Ghost variant="text" width={width} reduce={reduce} />
  }
}

function alignClass(align?: SkeletonColumn["align"]) {
  if (align === "right") return "text-right"
  if (align === "center") return "text-center"
  return "text-left"
}

function justifyClass(align?: SkeletonColumn["align"]) {
  if (align === "right") return "justify-end"
  if (align === "center") return "justify-center"
  return "justify-start"
}

/**
 * Body-only ghost rows, for embedding inside a table that already renders its
 * own header (e.g. a TanStack table). Returns a fragment of `<TableRow>`s.
 */
export function SkeletonRows({
  columns,
  rows = 5,
}: {
  columns: SkeletonColumn[]
  rows?: number
}) {
  const reduce = !!useReducedMotion()
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow
          key={rowIndex}
          aria-hidden="true"
          className="border-b border-[var(--workspace-border)] hover:bg-transparent"
        >
          {columns.map((col, colIndex) => (
            <TableCell key={colIndex} className={col.className}>
              <span className={cn("flex items-center", justifyClass(col.align))}>
                <GhostCell shape={col.shape} width={col.width} reduce={reduce} />
              </span>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export type SkeletonTableProps = {
  columns: SkeletonColumn[]
  /** Number of ghost rows. Defaults to 5. */
  rows?: number
  /** Render the static header row. Defaults to true. */
  withHeader?: boolean
  /** Wrapper classes (around the table container). */
  className?: string
  /** Extra classes on the `<table>` (e.g. a `min-w-[…]` to match the real one). */
  tableClassName?: string
}

/**
 * A self-contained `ax-table` skeleton: a static header (real column labels) and
 * N shimmering ghost rows that mirror the real table's chrome — same header,
 * row height, padding and borders — so the swap to data causes no layout shift.
 */
export function SkeletonTable({
  columns,
  rows = 5,
  withHeader = true,
  className,
  tableClassName,
}: SkeletonTableProps) {
  return (
    <div className={className} role="status" aria-busy="true" aria-label="Loading">
      <Table className={cn("ax-table", tableClassName)}>
        {withHeader ? (
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col, i) => (
                <TableHead key={i} className={cn(alignClass(col.align), col.className)}>
                  {col.header ?? null}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        ) : null}
        <TableBody>
          <SkeletonRows columns={columns} rows={rows} />
        </TableBody>
      </Table>
    </div>
  )
}

/**
 * Calm row-list skeleton matching the batches queue: an icon tile, two stacked
 * text lines, and a trailing status badge.
 */
export function SkeletonList({
  rows = 5,
  className,
}: {
  rows?: number
  className?: string
}) {
  const reduce = !!useReducedMotion()
  return (
    <div
      className={cn("flex flex-col gap-0.5", className)}
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <Ghost variant="iconlg" reduce={reduce} />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Ghost variant="text" width="55%" reduce={reduce} />
            <Ghost variant="text" width="32%" reduce={reduce} />
          </div>
          <Ghost variant="badge" reduce={reduce} className="hidden sm:block" />
        </div>
      ))}
    </div>
  )
}
