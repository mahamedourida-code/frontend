import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/dashboard/client'
  
  // Security: prevent open redirect attacks
  if (!next.startsWith('/')) {
    next = '/dashboard/client'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // First-time users go through onboarding before the workspace.
      const {
        data: { user },
      } = await supabase.auth.getUser()
      let dest = next
      if (user && !user.user_metadata?.onboarded_at) {
        dest = `/onboarding?next=${encodeURIComponent(next)}`
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${dest}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${dest}`)
      } else {
        return NextResponse.redirect(`${origin}${dest}`)
      }
    }
  }

  // If there's an error or no code, redirect to landing page
  return NextResponse.redirect(`${origin}/?error=auth_callback_error`)
}
