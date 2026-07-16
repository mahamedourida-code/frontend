import Link from "next/link"
import {
  Building2,
  FileSearch,
  FileSpreadsheet,
  Files,
  ListChecks,
  ReceiptText,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

type WorkflowTone = "blue" | "red" | "green"

type WorkflowStep = {
  label: string
  detail: string
  href: string
  icon: LucideIcon
  tone: WorkflowTone
}

const sharedSteps: WorkflowStep[] = [
  {
    label: "Upload a mixed stack",
    detail: "PDFs, photos and scans",
    href: "/dashboard/client#upload-files",
    icon: Files,
    tone: "blue",
  },
  {
    label: "Auto-detect documents",
    detail: "Invoices, receipts and more",
    href: "/dashboard/client#upload-files",
    icon: FileSearch,
    tone: "blue",
  },
  {
    label: "Review exceptions",
    detail: "Correct flagged fields and rows",
    href: "/dashboard/client",
    icon: ListChecks,
    tone: "red",
  },
]

const exportStep: WorkflowStep = {
  label: "Export Excel / CSV",
  detail: "Download the reviewed batch",
  href: "/dashboard/client",
  icon: FileSpreadsheet,
  tone: "green",
}

const publishStep: WorkflowStep = {
  label: "Publish draft bills",
  detail: "Send only after review",
  href: "/dashboard/accounts-payable",
  icon: ReceiptText,
  tone: "green",
}

const accountingStep: WorkflowStep = {
  label: "QuickBooks or Xero",
  detail: "Drafts stay under your control",
  href: "/dashboard/integrations",
  icon: Building2,
  tone: "green",
}

const toneClasses: Record<WorkflowTone, string> = {
  blue: "text-black",
  red: "text-black",
  green: "text-black",
}

function StepNode({ step, className }: { step: WorkflowStep; className?: string }) {
  const Icon = step.icon

  return (
    <Link
      href={step.href}
      className={cn(
        "flex min-h-20 w-full items-center gap-3 rounded-lg border border-[var(--workspace-border)] bg-card px-3.5 py-3 text-left shadow-none outline-none hover:border-[var(--workspace-primary)] hover:bg-[var(--workspace-row-hover)] focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)]/25",
        className,
      )}
    >
      <span
        className={cn("flex size-9 shrink-0 items-center justify-center", toneClasses[step.tone])}
        aria-hidden="true"
      >
        <Icon className="size-7 text-black" strokeWidth={1.6} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-5 text-foreground">
          {step.label}
        </span>
        <span className="block text-[11px] font-medium leading-4 text-muted-foreground">
          {step.detail}
        </span>
      </span>
    </Link>
  )
}

function HorizontalConnector() {
  return (
    <span className="relative h-px w-full border-t border-dashed border-sky-500" aria-hidden="true">
      <span className="absolute -right-px -top-[4px] size-2 rotate-45 border-r border-t border-sky-500" />
    </span>
  )
}

function VerticalConnector({ arrow = true }: { arrow?: boolean }) {
  return (
    <span className="relative h-7 border-l border-dashed border-sky-500" aria-hidden="true">
      {arrow ? (
        <span className="absolute -bottom-px -left-[4px] size-2 rotate-45 border-b border-r border-sky-500" />
      ) : null}
    </span>
  )
}

export function AxLinerWorkflowDiagram({ className }: { className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <ol
        className="hidden grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)_24px_minmax(0,1fr)_48px_minmax(0,1fr)_24px_minmax(0,1fr)] grid-rows-[5rem_5rem_5rem] items-center gap-y-4 lg:grid"
        aria-label="AxLiner document workflow"
      >
        {sharedSteps.map((step, index) => (
          <li key={step.label} className="contents">
            <StepNode
              step={step}
              className={cn(
                index === 0 && "col-start-1 row-start-2",
                index === 1 && "col-start-3 row-start-2",
                index === 2 && "col-start-5 row-start-2",
              )}
            />
            {index < sharedSteps.length - 1 ? (
              <span
                className={cn(
                  "row-start-2 flex items-center",
                  index === 0 ? "col-start-2" : "col-start-4",
                )}
              >
                <HorizontalConnector />
              </span>
            ) : null}
          </li>
        ))}

        <li className="col-start-7 row-start-1">
          <StepNode step={exportStep} />
        </li>
        <li className="col-start-7 row-start-3">
          <StepNode step={publishStep} />
        </li>
        <li className="col-start-9 row-start-3">
          <StepNode step={accountingStep} />
        </li>

        <li className="relative col-start-6 row-span-3 row-start-1 h-full" aria-hidden="true">
          <span className="absolute bottom-1/2 left-0 right-1/2 border-t border-dashed border-sky-500" />
          <span className="absolute bottom-10 left-1/2 top-10 border-l border-dashed border-sky-500" />
          <span className="absolute left-1/2 right-0 top-10 border-t border-dashed border-sky-500" />
          <span className="absolute bottom-10 left-1/2 right-0 border-t border-dashed border-sky-500" />
          <span className="absolute -right-px top-[2.28rem] size-2 rotate-45 border-r border-t border-sky-500" />
          <span className="absolute -right-px bottom-[2.28rem] size-2 rotate-45 border-r border-t border-sky-500" />
        </li>
        <li className="col-start-8 row-start-3 flex items-center" aria-hidden="true">
          <HorizontalConnector />
        </li>
      </ol>

      <ol className="flex flex-col items-center lg:hidden" aria-label="AxLiner document workflow">
        {sharedSteps.map((step, index) => (
          <li key={step.label} className="flex w-full max-w-md flex-col items-center">
            <StepNode step={step} />
            {index < sharedSteps.length - 1 ? <VerticalConnector /> : null}
          </li>
        ))}

        <li className="flex w-full max-w-xl flex-col items-center">
          <VerticalConnector arrow={false} />
          <span className="h-px w-1/2 border-t border-dashed border-sky-500" aria-hidden="true" />
          <ul className="grid w-full grid-cols-2 gap-3">
            <li className="flex min-w-0 flex-col items-center">
              <VerticalConnector />
              <StepNode
                step={exportStep}
                className="h-full flex-col items-start sm:flex-row sm:items-center"
              />
            </li>
            <li className="flex min-w-0 flex-col items-center">
              <VerticalConnector />
              <StepNode
                step={publishStep}
                className="h-full flex-col items-start sm:flex-row sm:items-center"
              />
              <VerticalConnector />
              <StepNode
                step={accountingStep}
                className="h-full flex-col items-start sm:flex-row sm:items-center"
              />
            </li>
          </ul>
        </li>
      </ol>
    </div>
  )
}
