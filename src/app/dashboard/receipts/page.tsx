"use client"

import { Suspense } from "react"
import { ProcessImagesContent } from "@/app/dashboard/client/page"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"

function ReceiptFallback() {
  return <DashboardRouteLoader label="Loading receipt workspace" />
}

export default function ReceiptModePage() {
  return (
    <Suspense fallback={<ReceiptFallback />}>
      <ProcessImagesContent documentMode="receipt" />
    </Suspense>
  )
}
