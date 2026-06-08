import { CompanyHub } from "@/components/dashboard/companies/CompanyHub"

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params
  return <CompanyHub companyId={companyId} />
}
