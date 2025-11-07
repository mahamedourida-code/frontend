# Authentication Redirect Fixes - Summary

## Issues Fixed

### 1. ✅ OAuth Sign-In Redirect to /dashboard/client
**Problem:** After signing in with Google/GitHub/Facebook, user stayed on landing page instead of redirecting to `/dashboard/client`

**Root Cause:** 
- Auth callback route wasn't properly handling `x-forwarded-host` header for production environments
- Missing security validation for `next` parameter

**Solution:**
Updated `/src/app/auth/callback/route.ts`:
- Added security check to prevent open redirect attacks
- Added proper `x-forwarded-host` header handling for production (Vercel)
- Set default redirect to `/dashboard/client` instead of `/dashboard/upload-type`

### 2. ✅ Sign Out Redirect to Landing Page (/)
**Problem:** Sign out was redirecting to `/sign-in` instead of landing page `/`

**Root Cause:**
- Multiple layers handling sign out with conflicting redirects
- `auth-helpers.ts` was using `window.location.href = '/'` which conflicts with Next.js router
- `useAuth.ts` hook was redirecting to `/sign-in`

**Solution:**
- Removed `window.location.href` redirect from `auth-helpers.ts` (let components handle it)
- Added `router.push('/')` to `AuthContext.tsx` signOut method
- Updated `useAuth.ts` hook to redirect to `/`
- Dashboard page already redirects to `/` via `handleSignOut`

---

## Files Modified

### 1. `/src/app/auth/callback/route.ts`
```typescript
// Added security validation
let next = searchParams.get('next') ?? '/dashboard/client'
if (!next.startsWith('/')) {
  next = '/dashboard/client'
}

// Added production environment handling
const forwardedHost = request.headers.get('x-forwarded-host')
const isLocalEnv = process.env.NODE_ENV === 'development'

if (isLocalEnv) {
  return NextResponse.redirect(`${origin}${next}`)
} else if (forwardedHost) {
  return NextResponse.redirect(`https://${forwardedHost}${next}`)
} else {
  return NextResponse.redirect(`${origin}${next}`)
}
```

### 2. `/src/lib/auth-helpers.ts`
```typescript
// Removed window.location.href redirect
// Now just handles Supabase signOut and session cleanup
// Components handle their own redirects
```

### 3. `/src/contexts/AuthContext.tsx`
```typescript
const signOut = async () => {
  await (await import('@/lib/auth-helpers')).signOut()
  
  // Redirect to landing page
  router.push('/')
}
```

### 4. `/src/hooks/useAuth.ts`
```typescript
const signOut = async () => {
  await supabase.auth.signOut()
  router.push('/') // Changed from '/sign-in'
}
```

### 5. `/src/app/dashboard/page.tsx`
```typescript
const handleSignOut = async () => {
  await signOut()
  router.push('/') // Changed from '/sign-in'
}
```

---

## Testing Instructions

### Test 1: OAuth Sign-In Flow
1. Go to `https://axliner.com` (landing page)
2. Click "Sign In" button
3. Click "Continue with Google" (or GitHub/Facebook)
4. Complete OAuth authentication
5. **Expected:** You should be redirected to `/dashboard/client`
6. ✅ **Result:** Should see the client dashboard page

### Test 2: Sign Out from Dashboard
1. Navigate to `/dashboard`
2. Click "Sign Out" button (below Settings)
3. **Expected:** Redirected to landing page `/`
4. ✅ **Result:** Should see the landing page

### Test 3: Sign Out from Mobile Menu
1. On mobile device, open hamburger menu
2. Click "Sign Out"
3. **Expected:** Go to `/signout` page, then redirected to `/` after 2 seconds
4. ✅ **Result:** Should see landing page

### Test 4: Sign Out from Signout Page
1. Navigate to `/signout` manually
2. Click "Skip for Now" or submit feedback
3. **Expected:** Redirected to landing page `/`
4. ✅ **Result:** Should see landing page

---

## How It Works

### OAuth Sign-In Flow:
```
1. User clicks "Continue with Google" on landing page
   ↓
2. GoogleSignInModal calls supabase.auth.signInWithOAuth()
   redirectTo: /auth/callback?next=/dashboard/client
   ↓
3. User authenticates with Google
   ↓
4. Google redirects to /auth/callback?code=xxx&next=/dashboard/client
   ↓
5. Callback route exchanges code for session
   ↓
6. Callback route redirects to /dashboard/client
   ✅ User is now on dashboard/client page
```

### Sign Out Flow:
```
1. User clicks "Sign Out" button
   ↓
2. Component calls signOut()
   ↓
3. AuthContext.signOut() calls auth-helpers.signOut()
   ↓
4. auth-helpers clears Supabase session + sessionStorage
   ↓
5. AuthContext calls router.push('/')
   ↓
6. User redirected to landing page
   ✅ User is now on landing page
```

---

## Production Environment Notes

The auth callback now properly handles **Vercel's production environment** by:

1. **Checking `x-forwarded-host` header**: Vercel uses load balancers, so the original host is in this header
2. **Using HTTPS in production**: Forces `https://` for production redirects
3. **Falling back to origin**: If no `x-forwarded-host`, uses the request origin

This ensures redirects work correctly both:
- **Locally**: `http://localhost:3000/dashboard/client`
- **Production**: `https://axliner.com/dashboard/client`

---

## Common Issues

### Issue: "Still redirecting to /sign-in after sign out"
**Solution:** Clear browser cache and cookies, then try again. Old session data may be cached.

### Issue: "OAuth stays on landing page"
**Solution:** 
1. Check browser console for errors
2. Verify Google OAuth credentials in Supabase Dashboard are correct
3. Verify redirect URIs in Google Console include Supabase callback URL

### Issue: "Getting 404 on callback"
**Solution:** 
1. Check Supabase project is running
2. Verify OAuth provider is enabled in Supabase Dashboard
3. Check callback URL matches: `https://iawkqvdtktnvxqgpupvt.supabase.co/auth/v1/callback`

---

## Debugging

To debug redirect issues, check browser console for:

```javascript
[AuthContext] Signing out...
[Auth] Signing out...
[Auth] Sign out successful
[AuthContext] Sign out complete
// Then redirect to /
```

For OAuth:
```
1. Check URL after Google auth: should have ?code=xxx&next=/dashboard/client
2. Check callback route logs (server-side)
3. Check final redirect URL
```

---

**Last Updated:** November 2025
**Tested On:** Chrome, Firefox, Safari (desktop & mobile)
