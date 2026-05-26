"use client"

import { Suspense } from "react"
import { ProcessImagesContent } from "@/app/dashboard/client/page"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"

function AutoDetectFallback() {
  return <DashboardRouteLoader label="Loading auto detect workspace" />
}

export default function AutoDetectModePage() {
  return (
    <Suspense fallback={<AutoDetectFallback />}>
      <ProcessImagesContent documentMode="auto" />
    </Suspense>
  )
}
