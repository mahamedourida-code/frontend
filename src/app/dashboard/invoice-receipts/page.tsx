"use client"

import { Suspense } from "react"
import { ProcessImagesContent } from "@/app/dashboard/client/page"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"

function InvoiceReceiptFallback() {
  return <DashboardRouteLoader label="Loading invoice workspace" />
}

export default function InvoiceReceiptModePage() {
  return (
    <Suspense fallback={<InvoiceReceiptFallback />}>
      <ProcessImagesContent documentMode="invoice_receipt" />
    </Suspense>
  )
}
