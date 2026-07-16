import { WorkspaceActivityIndicator } from "@/components/dashboard/WorkspaceActivityIndicator"

export function DashboardRouteLoader({ label }: { label?: string }) {
  return (
    <div className="min-h-svh bg-background px-5 pt-24">
      <div className="mx-auto max-w-4xl">
        <WorkspaceActivityIndicator title={label || "Loading workspace"} scope="page" />
      </div>
    </div>
  )
}
