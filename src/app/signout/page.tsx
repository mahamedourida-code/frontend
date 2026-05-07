"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function SignOutPage() {
  const router = useRouter()
  const { signOut } = useAuth()

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
  }, [router, signOut])

  return null
}
