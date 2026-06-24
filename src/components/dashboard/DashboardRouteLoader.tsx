import { WorkspaceActivityIndicator } from "@/components/dashboard/WorkspaceActivityIndicator"

export function DashboardRouteLoader({ label }: { label?: string }) {
  const activityLabel = {
    "Loading dashboard": "Opening workspace",
    "Loading workspace": "Opening workspace",
    "Loading clients": "Opening client list",
    "Loading client": "Opening client workspace",
    "Loading inbox": "Checking the intake inbox",
    "Loading stacks": "Retrieving the batch register",
    "Loading conversion workspace": "Opening review workspace",
    "Loading draft bills": "Retrieving draft bills",
    "Loading integrations": "Checking accounting connections",
    "Loading settings": "Opening workspace settings",
    "Loading setup": "Checking workspace setup",
    "Loading getting started": "Opening the workspace guide",
  }[label || ""] || label || "Opening workspace"

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-5">
      <WorkspaceActivityIndicator
        title={activityLabel}
        detail="Preparing the records and controls you need."
        scope="page"
        className="max-w-xl"
      />
    </div>
  )
}
