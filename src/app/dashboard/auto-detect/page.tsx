import { redirect } from "next/navigation"

export default function AutoDetectModePage() {
  redirect("/dashboard/client#upload-files")
}
