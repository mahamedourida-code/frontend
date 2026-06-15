import { redirect } from "next/navigation"

export default function AutoDetectModePage() {
  redirect("/dashboard/client?type=auto#upload-files")
}
