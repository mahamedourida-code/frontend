import { redirect } from "next/navigation"

export default function BankStatementModePage() {
  redirect("/dashboard/client?mode=bank_statement")
}
