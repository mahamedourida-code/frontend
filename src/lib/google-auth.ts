/**
 * Google OAuth Authentication for Sheets Export
 * Allows users to sign in with Google and export to their own Sheets
 */

// Google OAuth Configuration
const GOOGLE_OAUTH_CONFIG = {
  client_id: '', // Will be fetched from backend
  scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
  response_type: 'token',
  redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
}

// Google Identity Services (GIS) types
declare global {
  interface Window {
    google?: any
    gapi?: any
  }
}

class GoogleAuth {
  private static instance: GoogleAuth
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0
  private clientId: string | null = null

  private constructor() {}

  static getInstance(): GoogleAuth {
    if (!GoogleAuth.instance) {
      GoogleAuth.instance = new GoogleAuth()
    }
    return GoogleAuth.instance
  }

  /**
   * Initialize Google OAuth with config from backend
   */
  async initialize(): Promise<boolean> {
    try {
      // Fetch OAuth config from backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev'}/api/v1/google/oauth/config`
      )
      const config = await response.json()

      if (!config.configured || !config.client_id) {
        console.error('Google OAuth not configured on backend')
        return false
      }

      this.clientId = config.client_id
      GOOGLE_OAUTH_CONFIG.client_id = config.client_id

      // Load Google Identity Services library
      await this.loadGoogleScript()
      
      return true
    } catch (error) {
      console.error('Failed to initialize Google OAuth:', error)
      return false
    }
  }

  /**
   * Load Google Identity Services script
   */
  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.accounts?.oauth2) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
      document.head.appendChild(script)
    })
  }

  /**
   * Sign in with Google and get access token
   */
  async signIn(): Promise<string | null> {
    if (!this.clientId) {
      await this.initialize()
    }

    if (!this.clientId) {
      throw new Error('Google OAuth not configured. Please contact support.')
    }

    return new Promise((resolve, reject) => {
      try {
        // Initialize token client
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: GOOGLE_OAUTH_CONFIG.scope,
          callback: (response: any) => {
            if (response.error) {
              console.error('Google OAuth error:', response)
              reject(new Error(response.error_description || response.error))
              return
            }

            // Store token and expiration
            this.accessToken = response.access_token
            // Tokens typically expire in 1 hour (3600 seconds)
            this.tokenExpiresAt = Date.now() + (response.expires_in || 3600) * 1000
            
            console.log('Google sign-in successful')
            resolve(this.accessToken)
          },
        })

        // Request access token
        tokenClient.requestAccessToken()
      } catch (error) {
        console.error('Failed to sign in with Google:', error)
        reject(error)
      }
    })
  }

  /**
   * Get current access token (sign in if needed)
   */
  async getAccessToken(): Promise<string | null> {
    // Check if token exists and is still valid
    if (this.accessToken && this.tokenExpiresAt > Date.now() + 60000) {
      // Token exists and won't expire in the next minute
      return this.accessToken
    }

    // Need to sign in again
    return this.signIn()
  }

  /**
   * Sign out and clear token
   */
  signOut() {
    this.accessToken = null
    this.tokenExpiresAt = 0
    
    // Revoke token if possible
    if (this.accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(this.accessToken)
    }
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    return !!this.accessToken && this.tokenExpiresAt > Date.now()
  }
}

export const googleAuth = GoogleAuth.getInstance()
