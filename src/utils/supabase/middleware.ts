import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Debug logging - can be disabled in production
  const DEBUG_AUTH = process.env.NODE_ENV === 'development'

  if (DEBUG_AUTH) {
    console.log('[Middleware] Processing request:', pathname)
  }

  let supabaseResponse = NextResponse.next({
    request
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  let user = null
  try {
    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      if (DEBUG_AUTH) {
        console.warn('[Middleware] Error getting user:', error.message)
      }
      // Clear potentially corrupted session
      supabaseResponse.cookies.delete('sb-access-token')
      supabaseResponse.cookies.delete('sb-refresh-token')
    } else {
      user = data.user
    }
  } catch (error) {
    if (DEBUG_AUTH) {
      console.error('[Middleware] Exception getting user:', error)
    }
    // Clear session on exception
    supabaseResponse.cookies.delete('sb-access-token')
    supabaseResponse.cookies.delete('sb-refresh-token')
  }

  if (DEBUG_AUTH) {
    console.log('[Middleware] User authenticated:', !!user, user?.email || 'none')
  }

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/history', '/signout']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Public paths that should be accessible without auth
  const publicPaths = ['/sign-in', '/sign-up', '/auth', '/verify-email', '/forgot-password', '/reset-password']
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Redirect unauthenticated users trying to access protected routes
  if (!user && isProtectedPath) {
    if (DEBUG_AUTH) {
      console.log('[Middleware] Redirecting unauthenticated user to /sign-in from', pathname)
    }
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  // Allow authenticated users to visit auth pages
  // The page component will show "Already Authenticated" UI
  if (user && isPublicPath) {
    if (DEBUG_AUTH) {
      console.log('[Middleware] Authenticated user accessing auth page:', pathname)
      console.log('[Middleware] Allowing access - page will handle UI')
    }
    // Don't redirect - let the page show appropriate UI for authenticated users
  }

  if (DEBUG_AUTH && (isProtectedPath || isPublicPath)) {
    console.log('[Middleware] Allowing access to', pathname)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}