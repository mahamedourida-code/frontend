"use client"

import { useEffect } from "react"
import { signOut } from "@/lib/auth-helpers"

export default function SignOutPage() {
  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        await signOut()
      } finally {
        if (active) {
          window.location.replace("/")
        }
      }
    }

    run()

    return () => {
      active = false
    }
  }, [])

  return null
}
