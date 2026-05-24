"use client"

import { Suspense } from "react"
import { ProcessImagesContent } from "@/app/dashboard/client/page"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"

function BankStatementFallback() {
  return <DashboardRouteLoader label="Loading bank statement workspace" />
}

export default function BankStatementModePage() {
  return (
    <Suspense fallback={<BankStatementFallback />}>
      <ProcessImagesContent documentMode="bank_statement" />
    </Suspense>
  )
}
