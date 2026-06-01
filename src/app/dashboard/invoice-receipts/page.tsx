import { redirect } from "next/navigation"

export default function InvoiceReceiptModePage() {
  redirect("/dashboard/client?mode=invoice_receipt")
}
