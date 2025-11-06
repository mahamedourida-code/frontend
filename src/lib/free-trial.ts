/**
 * Free trial management utilities
 * Tracks anonymous user uploads using localStorage with UUID
 */

const FREE_TRIAL_LIMIT = 3
const STORAGE_KEY_UUID = 'AxLiner_trial_uuid'
const STORAGE_KEY_COUNT = 'AxLiner_trial_count'
const STORAGE_KEY_TIMESTAMP = 'AxLiner_trial_timestamp'

/**
 * Generate a unique user identifier
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Get or create anonymous user UUID
 */
export function getOrCreateTrialUUID(): string {
  if (typeof window === 'undefined') return ''

  let uuid = localStorage.getItem(STORAGE_KEY_UUID)

  if (!uuid) {
    uuid = generateUUID()
    localStorage.setItem(STORAGE_KEY_UUID, uuid)
    localStorage.setItem(STORAGE_KEY_COUNT, '0')
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString())
  }

  return uuid
}

/**
 * Get current upload count
 */
export function getTrialUploadCount(): number {
  if (typeof window === 'undefined') return 0

  const count = localStorage.getItem(STORAGE_KEY_COUNT)
  return count ? parseInt(count, 10) : 0
}

/**
 * Get remaining free uploads
 */
export function getRemainingTrialUploads(): number {
  const used = getTrialUploadCount()
  return Math.max(0, FREE_TRIAL_LIMIT - used)
}

/**
 * Check if user has free uploads remaining
 */
export function hasTrialUploadsRemaining(): boolean {
  return getRemainingTrialUploads() > 0
}

/**
 * Increment upload count
 * Returns the new count
 */
export function incrementTrialUploadCount(): number {
  if (typeof window === 'undefined') return 0

  const currentCount = getTrialUploadCount()
  const newCount = currentCount + 1

  localStorage.setItem(STORAGE_KEY_COUNT, newCount.toString())
  localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString())

  return newCount
}

/**
 * Reset trial data (for testing or after login)
 */
export function resetTrialData(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(STORAGE_KEY_UUID)
  localStorage.removeItem(STORAGE_KEY_COUNT)
  localStorage.removeItem(STORAGE_KEY_TIMESTAMP)
}

/**
 * Get trial info
 */
export function getTrialInfo() {
  return {
    uuid: getOrCreateTrialUUID(),
    used: getTrialUploadCount(),
    remaining: getRemainingTrialUploads(),
    hasRemaining: hasTrialUploadsRemaining(),
    limit: FREE_TRIAL_LIMIT
  }
}

/**
 * Check if trial has expired (optional - can be used for time-based limits)
 * Currently not used, but available for future implementation
 */
export function isTrialExpired(expiryDays: number = 7): boolean {
  if (typeof window === 'undefined') return false

  const timestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP)
  if (!timestamp) return false

  const created = parseInt(timestamp, 10)
  const now = Date.now()
  const daysSinceCreation = (now - created) / (1000 * 60 * 60 * 24)

  return daysSinceCreation > expiryDays
}
