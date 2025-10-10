import { createClient } from '@/utils/supabase/client'

// Create a single Supabase client instance using SSR-compatible client
const supabase = createClient()

/**
 * Rate limiting helper to prevent brute force attacks
 */
class RateLimiter {
  private attempts: Map<string, { count: number; timestamp: number }> = new Map()
  private readonly maxAttempts = 5
  private readonly windowMs = 15 * 60 * 1000 // 15 minutes

  isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record) {
      this.attempts.set(identifier, { count: 1, timestamp: now })
      return false
    }

    // Reset if window has passed
    if (now - record.timestamp > this.windowMs) {
      this.attempts.set(identifier, { count: 1, timestamp: now })
      return false
    }

    // Increment attempts
    record.count++

    if (record.count > this.maxAttempts) {
      return true
    }

    return false
  }

  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier)
    if (!record) return 0

    const elapsed = Date.now() - record.timestamp
    const remaining = this.windowMs - elapsed

    return remaining > 0 ? Math.ceil(remaining / 1000 / 60) : 0
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

export const rateLimiter = new RateLimiter()

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Check if user exists in the database
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    // Try to get user by email using admin API is not available in client
    // Instead, we'll attempt a password reset which won't fail if user doesn't exist
    // This is a security best practice to not reveal if emails are registered

    // For signup, Supabase will handle this automatically
    // The identities array will be empty if user exists

    return false // We can't definitively check without admin access
  } catch (error) {
    console.error('Error checking user existence:', error)
    return false
  }
}

/**
 * Send verification email with OTP
 */
export const sendVerificationEmail = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Verify OTP code with improved error handling
 */
export const verifyOTP = async (email: string, token: string) => {
  // Validate inputs
  if (!email || !token) {
    throw new Error('Email and verification code are required')
  }

  if (token.length !== 6 || !/^\d{6}$/.test(token)) {
    throw new Error('Verification code must be 6 digits')
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) {
      // Handle specific error types
      if (error.message?.toLowerCase().includes('expired')) {
        throw new Error('Verification code has expired. Please request a new one.')
      }
      
      if (error.message?.toLowerCase().includes('invalid')) {
        throw new Error('Invalid verification code. Please check and try again.')
      }

      if (error.message?.toLowerCase().includes('too many')) {
        throw new Error('Too many attempts. Please wait before trying again.')
      }

      // Generic error handling
      throw new Error(error.message || 'Verification failed. Please try again.')
    }

    // Ensure we have a valid session
    if (!data.session && !data.user) {
      throw new Error('Verification succeeded but no session was created. Please try signing in again.')
    }

    return data
  } catch (error: any) {
    // Re-throw our custom errors
    if (error.message?.includes('Verification code has expired') || 
        error.message?.includes('Invalid verification code') ||
        error.message?.includes('Too many attempts')) {
      throw error
    }

    // Handle unexpected errors
    console.error('Unexpected OTP verification error:', error)
    throw new Error('An unexpected error occurred during verification. Please try again.')
  }
}

/**
 * Sign up with email + password and send OTP verification
 */
export const signUpWithEmailVerification = async (
  email: string,
  password: string,
  metadata?: Record<string, any>
) => {
  // Validate inputs
  if (!validateEmail(email)) {
    throw new Error('Invalid email format')
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors[0])
  }

  // Check rate limiting
  if (rateLimiter.isRateLimited(email)) {
    const remainingMinutes = rateLimiter.getRemainingTime(email)
    throw new Error(
      `Too many attempts. Please try again in ${remainingMinutes} minutes.`
    )
  }

  // Sign up with Supabase - this creates the user with password
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  // Check if user already exists
  if (data?.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists. Please sign in instead.')
  }

  return data
}

/**
 * Sign in with password
 */
export const signInWithPassword = async (email: string, password: string) => {
  // Check rate limiting
  if (rateLimiter.isRateLimited(email)) {
    const remainingMinutes = rateLimiter.getRemainingTime(email)
    throw new Error(
      `Too many failed attempts. Please try again in ${remainingMinutes} minutes.`
    )
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  // Reset rate limiter on successful login
  rateLimiter.reset(email)

  return data
}

/**
 * Sign in with OTP (passwordless)
 */
export const signInWithOTP = async (email: string) => {
  // Check rate limiting
  if (rateLimiter.isRateLimited(email)) {
    const remainingMinutes = rateLimiter.getRemainingTime(email)
    throw new Error(
      `Too many attempts. Please try again in ${remainingMinutes} minutes.`
    )
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Two-Factor Authentication: Verify password and send OTP
 * Simplified flow (NO signOut needed - OTP verification creates new session):
 * 1. Verify credentials with password (creates temp session)
 * 2. Send OTP for 2FA
 * 3. User verifies OTP to complete sign-in (creates final session)
 */
export const verifyCredentialsAndSendOTP = async (
  email: string,
  password: string
) => {
  // Check rate limiting
  if (rateLimiter.isRateLimited(email)) {
    const remainingMinutes = rateLimiter.getRemainingTime(email)
    throw new Error(
      `Too many attempts. Please try again in ${remainingMinutes} minutes.`
    )
  }

  // Step 1: Verify the credentials by attempting sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    throw new Error('Invalid email or password')
  }

  // Check if email is confirmed
  const needsEmailVerification = signInData.user && !signInData.user.email_confirmed_at

  // Step 2: Send OTP for 2FA (NO signOut needed!)
  // The OTP verification will create a new session that replaces the temp one
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  })

  if (otpError) {
    throw new Error('Failed to send verification code. Please try again.')
  }

  // Reset rate limiter on successful credential verification
  rateLimiter.reset(email)

  return {
    needsEmailVerification: needsEmailVerification || false,
    user: signInData.user,
  }
}

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string) => {
  // Check rate limiting
  if (rateLimiter.isRateLimited(`reset-${email}`)) {
    const remainingMinutes = rateLimiter.getRemainingTime(`reset-${email}`)
    throw new Error(
      `Too many reset requests. Please try again in ${remainingMinutes} minutes.`
    )
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Update password
 */
export const updatePassword = async (newPassword: string) => {
  const passwordValidation = validatePassword(newPassword)
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors[0])
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session
}
