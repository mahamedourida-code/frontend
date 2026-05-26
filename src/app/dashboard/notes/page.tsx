"use client"

import { Suspense } from "react"
import { ProcessImagesContent } from "@/app/dashboard/client/page"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"

function NotesFallback() {
  return <DashboardRouteLoader label="Loading notes workspace" />
}

export default function NotesModePage() {
  return (
    <Suspense fallback={<NotesFallback />}>
      <ProcessImagesContent documentMode="notes" />
    </Suspense>
  )
}
