'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const { user } = useAuth() // Use AuthContext to track user state

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationTimeout, setVerificationTimeout] = useState<NodeJS.Timeout | null>(null)
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0)

  // Auto-redirect when user becomes authenticated via AuthContext
  useEffect(() => {
    if (user && verificationSuccess) {
      console.log('✓ User authenticated via AuthContext, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [user, verificationSuccess, router])

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent multiple simultaneous verification attempts
    if (isSubmitting || loading) {
      console.log('Verification already in progress, skipping...')
      return
    }

    // Add debounce protection - minimum 3 seconds between attempts
    const now = Date.now()
    if (now - lastSubmissionTime < 3000) {
      setError('Please wait a moment before trying again.')
      return
    }
    setLastSubmissionTime(now)

    console.log('Starting OTP verification for email:', email)
    console.log('OTP code:', otp)

    setIsSubmitting(true)
    setLoading(true)
    setError(null)

    // Clear any existing timeout
    if (verificationTimeout) {
      clearTimeout(verificationTimeout)
    }

    // Set a timeout for verification (30 seconds)
    const timeout = setTimeout(() => {
      setError('Verification timed out. Please try again.')
      setLoading(false)
      setIsSubmitting(false)
    }, 30000)
    setVerificationTimeout(timeout)

    try {
      // Use 'email' type for email OTP verification
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      // Clear timeout on completion
      clearTimeout(timeout)
      setVerificationTimeout(null)

      console.log('Verify OTP response:', { hasData: !!data, hasError: !!error, hasSession: !!data?.session })

      if (error) {
        console.error('✗ OTP verification error:', error)
        
        // Handle specific error cases
        if (error.message?.includes('429') || error.message?.includes('rate limit') || error.message?.includes('Request rate limit')) {
          setError('Too many verification attempts. Please wait a few minutes before trying again.')
        } else if (error.message?.includes('expired') || error.message?.includes('invalid')) {
          setError('Verification code has expired or is invalid. Please request a new code.')
        } else {
          setError(error.message || 'Verification failed. Please check your code and try again.')
        }
        setLoading(false)
        setIsSubmitting(false)
        return
      }

      if (data?.session) {
        console.log('✓ Email verified successfully, user is now signed in')

        // Show success screen - AuthContext will handle redirect when user state updates
        setVerificationSuccess(true)
        setLoading(false)
        setIsSubmitting(false)
        
        // AuthContext useEffect will automatically redirect when user becomes available
      } else {
        console.error('⚠ Verification succeeded but no session created')
        setError('Verification failed. Please try again.')
        setLoading(false)
        setIsSubmitting(false)
      }
    } catch (err: any) {
      // Clear timeout on error
      if (verificationTimeout) {
        clearTimeout(verificationTimeout)
        setVerificationTimeout(null)
      }
      
      console.error('✗ Unexpected error:', err)
      setError(err?.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    setResending(true)
    setResendSuccess(false)
    setError(null)

    try {
      // For existing users, use signInWithOtp
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) {
        console.error('Resend error:', error)
        // Handle specific error cases
        if (error.message.includes('Email rate limit exceeded')) {
          setError('Please wait before requesting another code. Try again in a few minutes.')
        } else {
          setError(error.message)
        }
      } else {
        setResendSuccess(true)
        console.log('✓ Verification code resent successfully')
        // Auto-hide success message
        setTimeout(() => setResendSuccess(false), 5000)
      }
    } catch (err: any) {
      console.error('Unexpected error:', err)
      setError('Failed to resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (verificationTimeout) {
        clearTimeout(verificationTimeout)
      }
    }
  }, [verificationTimeout])

  // Handle paste event to auto-fill OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('text')
    const cleanedData = pastedData.replace(/\D/g, '').slice(0, 6)
    setOtp(cleanedData)
  }

  // Disable auto-submit to prevent rate limiting issues
  // Instead, users must manually click the verify button
  // This prevents rapid-fire verification attempts that trigger Supabase rate limits

  // Show success screen if verification succeeded
  if (verificationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified and you're now signed in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Redirecting you to dashboard...
            </p>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to<br />
            <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* OTP Input */}
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                type="text"
                id="otp"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setOtp(value)
                }}
                onPaste={handlePaste}
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                required
                disabled={loading || isSubmitting}
                autoFocus
                autoComplete="one-time-code"
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code from your email, then click Verify
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            {/* Success Message */}
            {resendSuccess && (
              <div className="text-sm text-green-600 text-center p-2 bg-green-50 dark:bg-green-950 rounded-md">
                Verification code resent successfully!
              </div>
            )}

            {/* Submit Button */}
            <Button 
              className="w-full" 
              size="lg" 
              type="submit" 
              disabled={loading || isSubmitting || otp.length !== 6}
            >
              {loading || isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="text-center space-y-3">
            <div className="text-sm text-muted-foreground">
              Didn't receive the code?{' '}
              <button
                onClick={handleResendCode}
                disabled={resending}
                className="text-primary hover:text-primary/80 font-semibold underline-offset-4 hover:underline disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>

            {/* Back to Sign In */}
            <Link
              href="/sign-in"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
