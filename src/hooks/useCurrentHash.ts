"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function useCurrentHash() {
  const pathname = usePathname()
  const [hash, setHash] = useState("")

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash)

    syncHash()
    window.addEventListener("hashchange", syncHash)
    window.addEventListener("axliner:location-changed", syncHash)
    return () => {
      window.removeEventListener("hashchange", syncHash)
      window.removeEventListener("axliner:location-changed", syncHash)
    }
  }, [pathname])

  return hash
}
