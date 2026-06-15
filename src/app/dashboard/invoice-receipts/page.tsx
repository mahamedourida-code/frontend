import { redirect } from "next/navigation"

export default function InvoiceReceiptModePage() {
  redirect("/dashboard/client?type=invoice_receipt#upload-files")
}
