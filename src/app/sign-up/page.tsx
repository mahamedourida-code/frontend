"use client"

import { Suspense } from "react"

import { AuthScreen } from "@/components/auth/AuthScreen"

function AuthFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="h-12 w-12 rounded-full border-4 border-border border-t-primary animate-spin" />
    </main>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthScreen mode="sign-up" />
    </Suspense>
  )
}
