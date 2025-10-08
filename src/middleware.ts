import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware is simplified - we rely on client-side AuthContext for protection
// because Supabase sessions are stored in localStorage which isn't accessible server-side
export async function middleware(request: NextRequest) {
  // Just pass through - protection happens in AuthContext
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/workspace/:path*',
    '/settings/:path*',
    '/history/:path*',
  ]
}
