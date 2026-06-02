import { CompaniesTable } from "@/components/dashboard/companies/CompaniesTable"

export function ClientsTab({ workspaceId }: { workspaceId?: string; compact?: boolean }) {
  return <CompaniesTable workspaceId={workspaceId} />
}
