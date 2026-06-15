import { redirect } from "next/navigation"

export default function BankStatementModePage() {
  redirect("/dashboard/client?type=bank_statement#upload-files")
}
