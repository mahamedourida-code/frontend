"use client"

import Script from "next/script"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"

type GoogleCredentialResponse = {
  credential?: string
  select_by?: string
}

type GoogleOneTapProps = {
  enabled?: boolean
  redirectPath?: string
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
            context?: "signin" | "signup" | "use"
            cancel_on_tap_outside?: boolean
            prompt_parent_id?: string
            itp_support?: boolean
          }) => void
          prompt: () => void
          cancel: () => void
        }
      }
    }
  }
}

const ONE_TAP_CONTAINER_ID = "axliner-google-one-tap"

export function GoogleOneTap({ enabled = true, redirectPath = "/dashboard/client" }: GoogleOneTapProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [scriptReady, setScriptReady] = useState(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!enabled || !scriptReady || initializedRef.current) return

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const googleId = window.google?.accounts?.id

    if (!clientId || !googleId) return

    let cancelled = false

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled || data.session) return

      initializedRef.current = true

      googleId.initialize({
        client_id: clientId,
        context: "signup",
        prompt_parent_id: ONE_TAP_CONTAINER_ID,
        cancel_on_tap_outside: true,
        itp_support: true,
        callback: async (response) => {
          if (!response.credential) return

          const { error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
          })

          if (error) {
            initializedRef.current = false
            toast.error("Google sign in failed", {
              description: error.message,
            })
            return
          }

          router.push(redirectPath)
          router.refresh()
        },
      })

      googleId.prompt()
    })

    return () => {
      cancelled = true
      window.google?.accounts?.id?.cancel()
    }
  }, [enabled, redirectPath, router, scriptReady, supabase])

  if (!enabled) return null

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div
        id={ONE_TAP_CONTAINER_ID}
        className="fixed right-3 top-24 z-[80] sm:right-5 lg:right-8"
      />
    </>
  )
}
