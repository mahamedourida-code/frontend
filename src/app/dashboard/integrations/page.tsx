import { redirect } from "next/navigation"

export default async function IntegrationsRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const incoming = await searchParams
  const params = new URLSearchParams()

  Object.entries(incoming).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => params.append(key, item))
    } else if (value !== undefined) {
      params.set(key, value)
    }
  })

  params.set("section", "accounting")
  redirect(`/dashboard/settings?${params.toString()}`)
}
