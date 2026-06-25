"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"

import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow"

function Fallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <Loader2 className="h-7 w-7 animate-spin text-[#021b16]" />
    </main>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <OnboardingFlow />
    </Suspense>
  )
}
