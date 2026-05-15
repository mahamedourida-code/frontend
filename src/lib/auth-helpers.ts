import { createClient } from '@/utils/supabase/client'

/**
 * Sign out - let Supabase handle session cleanup.
 * Note: Redirect should be handled by the calling component.
 */
export const signOut = async () => {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }

  if (typeof window !== 'undefined') {
    const appFlags = [
      'wasProcessing',
      'uploadedFilesCache',
      'olmocr_processing_state',
    ]
    appFlags.forEach(key => {
      sessionStorage.removeItem(key)
      localStorage.removeItem(key)
    })
  }
}

export const getCurrentUser = async () => {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

export const getCurrentSession = async () => {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session
}
