import { redirect } from "next/navigation"

export default function InvoiceModePage() {
  redirect("/dashboard/client?type=invoice#upload-files")
}
