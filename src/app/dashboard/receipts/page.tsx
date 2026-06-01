import { redirect } from "next/navigation"

export default function ReceiptModePage() {
  redirect("/dashboard/client?mode=receipt")
}
