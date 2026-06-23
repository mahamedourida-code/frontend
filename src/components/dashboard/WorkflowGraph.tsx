import { AxLinerWorkflowDiagram } from "@/components/dashboard/AxLinerWorkflowDiagram"

export function WorkflowGraph({ className }: { className?: string }) {
  return (
    <nav aria-label="Workspace workflow" className={className}>
      <AxLinerWorkflowDiagram />
    </nav>
  )
}
