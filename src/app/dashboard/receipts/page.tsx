import { redirect } from "next/navigation"

export default function ReceiptModePage() {
  redirect("/dashboard/client?type=receipt#upload-files")
}
