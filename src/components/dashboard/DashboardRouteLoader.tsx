import { WorkspaceActivityIndicator } from "@/components/dashboard/WorkspaceActivityIndicator"

export function DashboardRouteLoader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-5">
      <WorkspaceActivityIndicator title={label || "Loading"} scope="page" />
    </div>
  )
}
