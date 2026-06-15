import { redirect } from "next/navigation"

export default function NotesModePage() {
  redirect("/dashboard/client?type=notes#upload-files")
}
