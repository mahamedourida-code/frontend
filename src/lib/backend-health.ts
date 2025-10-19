/**
 * Backend health check and wake-up utilities
 * Handles cold start issues especially for mobile devices
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev'

export interface HealthCheckResult {
  status: 'healthy' | 'waking' | 'error'
  message?: string
  responseTime?: number
}

/**
 * Wake up the backend server with retry logic
 * Mobile-optimized with shorter initial timeout
 */
export async function wakeUpBackend(): Promise<HealthCheckResult> {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const maxRetries = isMobile ? 4 : 3
  const baseTimeout = isMobile ? 5000 : 10000 // 5s for mobile, 10s for desktop
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), baseTimeout * (attempt + 1))
      
      const startTime = Date.now()
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      clearTimeout(timeout)
      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        return {
          status: 'healthy',
          message: 'Backend is ready',
          responseTime
        }
      }
      
      // If we get a response but not OK, backend is waking up
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))) // Exponential backoff
        continue
      }
      
    } catch (error: any) {
      // If it's a timeout and we have retries left, continue
      if (error.name === 'AbortError' && attempt < maxRetries - 1) {
        console.log(`Wake attempt ${attempt + 1} timed out, retrying...`)
        await new Promise(resolve => setTimeout(resolve, 500)) // Short delay between retries
        continue
      }
      
      // For other errors or last attempt
      if (attempt === maxRetries - 1) {
        return {
          status: 'error',
          message: 'Backend is taking longer than usual to start. Please try again.',
          responseTime: 0
        }
      }
    }
  }
  
  return {
    status: 'waking',
    message: 'Backend is starting up...',
    responseTime: 0
  }
}

/**
 * Keep backend warm with periodic pings
 * Especially important for mobile users
 */
export class BackendKeepAlive {
  private intervalId: NodeJS.Timeout | null = null
  private isActive = false
  
  start(intervalMs = 30000) { // Ping every 30 seconds
    if (this.isActive) return
    
    this.isActive = true
    this.intervalId = setInterval(async () => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000) // 3s timeout for keep-alive
        
        await fetch(`${API_URL}/health`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        clearTimeout(timeout)
      } catch (error) {
        console.log('Keep-alive ping failed (normal if backend is scaling down)')
      }
    }, intervalMs)
    
    // Send first ping immediately
    this.ping()
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isActive = false
  }
  
  private async ping() {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 3000)
      
      await fetch(`${API_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      clearTimeout(timeout)
    } catch {
      // Ignore errors for keep-alive pings
    }
  }
}

/**
 * Create a fetch wrapper with automatic retry for mobile
 */
export function createMobileFriendlyFetch() {
  return async function fetchWithRetry(
    url: string,
    options?: RequestInit,
    maxRetries = 3
  ): Promise<Response> {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const baseTimeout = isMobile ? 10000 : 15000
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(
          () => controller.abort(),
          baseTimeout * (attempt + 1) // Increase timeout with each retry
        )
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        })
        
        clearTimeout(timeout)
        
        if (response.ok || response.status < 500) {
          return response
        }
        
        // For 5xx errors, retry
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
          continue
        }
        
        return response
        
      } catch (error: any) {
        if (error.name === 'AbortError' && attempt < maxRetries - 1) {
          console.log(`Request attempt ${attempt + 1} timed out, retrying...`)
          await new Promise(resolve => setTimeout(resolve, 500))
          continue
        }
        
        if (attempt === maxRetries - 1) {
          throw error
        }
      }
    }
    
    throw new Error('Max retries exceeded')
  }
}

// Export singleton keep-alive instance
export const backendKeepAlive = new BackendKeepAlive()
