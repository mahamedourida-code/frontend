"use client"

import { Suspense } from "react"
import { ProcessImagesContent } from "@/app/dashboard/client/page"

function BankStatementFallback() {
  return (
    <div className="min-h-screen bg-secondary p-3 sm:p-4">
      <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center rounded-xl border border-border bg-card/60 backdrop-blur-xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    </div>
  )
}

export default function BankStatementModePage() {
  return (
    <Suspense fallback={<BankStatementFallback />}>
      <ProcessImagesContent documentMode="bank_statement" />
    </Suspense>
  )
}
