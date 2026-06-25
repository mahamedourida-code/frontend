import { type EmailOtpType } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

import { createClient } from "@/utils/supabase/server"

function getSafeRedirect(request: NextRequest, next: string | null) {
  const fallback = new URL("/dashboard/client", request.url)

  if (!next) return fallback

  if (next.startsWith("/")) {
    return new URL(next, request.url)
  }

  try {
    const candidate = new URL(next)
    const currentOrigin = request.nextUrl.origin
    const allowedOrigins = new Set(
      [
        currentOrigin,
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.NEXT_PUBLIC_APP_URL,
        "https://www.axliner.com",
      ].filter(Boolean)
    )

    if (allowedOrigins.has(candidate.origin)) {
      return candidate
    }
  } catch {
    return fallback
  }

  return fallback
}

// Send first-time users through onboarding before the workspace.
async function gateOnboarding(
  supabase: Awaited<ReturnType<typeof createClient>>,
  request: NextRequest,
  redirectTo: URL,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && !user.user_metadata?.onboarded_at) {
    const url = new URL("/onboarding", request.url)
    url.searchParams.set("next", redirectTo.pathname + redirectTo.search)
    return url
  }
  return redirectTo
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash")
  const code = request.nextUrl.searchParams.get("code")
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null
  const redirectTo = getSafeRedirect(request, request.nextUrl.searchParams.get("next"))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(await gateOnboarding(supabase, request, redirectTo))
    }
  }

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })

    if (!error) {
      return NextResponse.redirect(await gateOnboarding(supabase, request, redirectTo))
    }
  }

  const errorUrl = new URL("/", request.url)
  errorUrl.searchParams.set("error", "auth_confirm_error")
  return NextResponse.redirect(errorUrl)
}
