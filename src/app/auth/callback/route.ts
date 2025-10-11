import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    // Create response object first
    let response = NextResponse.redirect(`${requestUrl.origin}${next}`)

    // Create Supabase server client with proper cookie handling
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Set cookies on the response object
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Exchange code for session - SSR client handles cookies automatically
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Success - cookies already set by SSR client
      return response
    }

    console.error('[Auth Callback] Error exchanging code for session:', error)
  }

  // Redirect to error page if something went wrong
  return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=auth_callback_failed`)
}