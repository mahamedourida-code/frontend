/**
 * Backend wake-up utilities
 * Silently wakes the backend without blocking the user
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev'

/**
 * Silently wake up the backend server
 * Fires a request without waiting or blocking the UI
 */
export async function wakeUpBackendSilently(): Promise<void> {
  try {
    // Use a simple GET to the API base - this will wake the backend
    // We don't care about the response, just triggering the wake-up
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout
    
    fetch(`${API_URL}/api/v1/`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(() => {
      // Silently ignore errors - this is just a wake-up call
      console.log('Backend wake-up call sent')
    }).finally(() => {
      clearTimeout(timeout)
    })
  } catch {
    // Ignore all errors - this is fire and forget
  }
}


