"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-helpers"

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        await signOut()
      } finally {
        if (active) {
          router.replace("/")
        }
      }
    }

    run()

    return () => {
      active = false
    }
  }, [router])

  return null
}
