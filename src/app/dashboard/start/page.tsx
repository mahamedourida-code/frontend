import { redirect } from "next/navigation"

export default function StartPage(): never {
  redirect("/dashboard")
}
