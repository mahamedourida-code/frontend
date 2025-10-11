'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInSchema, type SignInInput } from '@/lib/validations/auth'
import { signInWithPassword, signInWithOTP } from '@/lib/auth-helpers'
import { createClient } from '@/utils/supabase/client'
import { AlertCircle, Loader2, CheckCircle2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/contexts/AuthContext'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [usePasswordless, setUsePasswordless] = useState(false) // Default to password authentication
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use auth context instead of creating our own client
  const { user, loading: authLoading, signOut } = useAuth()
  const supabase = createClient() // Only for OAuth, main auth handled by context

  // Show success message if user just verified their email
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified successfully!', {
        description: 'You can now sign in with your credentials.',
      })
    }
  }, [searchParams])

  // Cleanup effect: Clean up any leftover session storage on component unmount
  useEffect(() => {
    return () => {
      // Clear any leftover session storage when navigating away
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('in2FAFlow')
        sessionStorage.removeItem('in2FAFlowTimestamp')
        sessionStorage.removeItem('otpVerified')
      }
    }
  }, [])

  const {
    register: registerSignIn,
    handleSubmit: handleSignInSubmit,
    formState: { errors: signInErrors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })

  // Handle password sign-in with retry mechanism
  const onSignInSubmit = async (data: SignInInput, retryCount = 0) => {
    const maxRetries = 2
    setLoading(true)
    setError(null)
    setEmail(data.email)

    try {
      if (!data.password) {
        setError('Password is required')
        setLoading(false)
        return
      }

      console.log('[SignIn] Attempting sign-in...', retryCount > 0 ? `(retry ${retryCount})` : '')

      // Direct sign-in with password (no OTP required)
      await signInWithPassword(data.email, data.password)

      toast.success('Signed in successfully!', {
        description: 'Redirecting to dashboard...',
      })

      // AuthContext will handle the redirect automatically
      console.log('[SignIn] Sign-in successful, waiting for redirect...')

    } catch (err: any) {
      console.error('Sign in error:', err)

      // Retry logic for network-related errors
      if (retryCount < maxRetries &&
          (err.message?.includes('network') ||
           err.message?.includes('timeout') ||
           err.message?.includes('fetch'))) {

        console.log(`[SignIn] Retrying sign-in (${retryCount + 1}/${maxRetries})...`)
        toast.info(`Retrying... (${retryCount + 1}/${maxRetries})`)

        // Exponential backoff
        setTimeout(() => {
          onSignInSubmit(data, retryCount + 1)
        }, 1000 * (retryCount + 1))
        return
      }

      // Handle specific error types
      let errorMessage = 'Invalid email or password'
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.'
      } else if (err.message?.includes('too many')) {
        errorMessage = 'Too many attempts. Please wait before trying again.'
      } else if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      toast.error('Sign in failed', {
        description: errorMessage,
      })
      setLoading(false)
    }
  }

  // Handle passwordless sign-in (magic link / OTP)
  const handlePasswordlessSignIn = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await signInWithOTP(email)

      toast.success('Sign-in code sent!', {
        description: 'Check your email for a 6-digit code.',
      })

      // Redirect to verification page
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      console.error('Passwordless sign in error:', err)
      setError(err.message || 'Failed to send sign-in code')
      toast.error('Failed to send code', {
        description: err.message,
      })
      setLoading(false)
    }
  }


  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      toast.error('Sign in failed', {
        description: error.message,
      })
    }
  }

  // Handle GitHub Sign-in
  const handleGithubSignIn = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      toast.error('Sign in failed', {
        description: error.message,
      })
    }
  }



  // Show loading state while auth context is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/80">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Loading...</CardTitle>
            <CardDescription>Checking authentication status</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show "Already Authenticated" message if user is logged in
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/80">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md border-2 border-primary/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Already Signed In</CardTitle>
            <CardDescription>
              You're currently signed in as {user.email}. Choose an option below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={async () => {
                try {
                  await signOut() // Use auth context signOut
                  toast.success('Signed out successfully')
                } catch (err) {
                  toast.error('Failed to sign out')
                }
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out & Sign In as Different User
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render Credentials Step
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/80">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your Exceletto account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSignInSubmit(onSignInSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                type="email"
                id="email"
                placeholder="Enter your email"
                {...registerSignIn('email')}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {signInErrors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {signInErrors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            {!usePasswordless && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  {...registerSignIn('password')}
                  disabled={loading}
                />
                {signInErrors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {signInErrors.password.message}
                  </p>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}


            {/* Submit Button */}
            <Button
              className="w-full"
              size="lg"
              type={usePasswordless ? 'button' : 'submit'}
              onClick={usePasswordless ? () => handlePasswordlessSignIn() : undefined}
              disabled={loading || authLoading}
            >
              {(loading || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {(loading || authLoading) ? 'Signing in...' : (usePasswordless ? 'Send verification code' : 'Sign in')}
            </Button>

            {/* Toggle between password and passwordless */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setUsePasswordless(!usePasswordless)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                {usePasswordless ? 'Sign in with password instead' : 'Sign in with email code instead'}
              </button>
            </div>

          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Sign-in */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleGithubSignIn}
              disabled={loading}
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/sign-up"
              className="text-primary hover:text-primary/80 font-semibold underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
