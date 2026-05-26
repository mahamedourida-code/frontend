"use client"

import { Suspense } from "react"
import { ProcessImagesContent } from "@/app/dashboard/client/page"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"

function InvoiceFallback() {
  return <DashboardRouteLoader label="Loading invoice workspace" />
}

export default function InvoiceModePage() {
  return (
    <Suspense fallback={<InvoiceFallback />}>
      <ProcessImagesContent documentMode="invoice" />
    </Suspense>
  )
}
