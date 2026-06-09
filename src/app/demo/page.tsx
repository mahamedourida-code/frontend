import { redirect } from "next/navigation"

// The demo lives as a modal over the page (?demo=1), not a standalone route.
// Direct visits to /demo open it over the landing page.
export default function DemoPage() {
  redirect("/?demo=1")
}
