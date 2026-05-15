import { createClient } from '@/utils/supabase/client'

/**
 * Sign out - let Supabase handle session cleanup.
 * Note: Redirect should be handled by the calling component.
 */
export const signOut = async () => {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut({ scope: 'global' })

  if (typeof window !== 'undefined') {
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0]?.trim()
      if (name && (name.startsWith('sb-') || name.toLowerCase().includes('supabase'))) {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
      }
    })

    const appFlags = [
      'wasProcessing',
      'uploadedFilesCache',
      'olmocr_processing_state',
    ]
    appFlags.forEach(key => {
      sessionStorage.removeItem(key)
      localStorage.removeItem(key)
    })

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.toLowerCase().includes('supabase')) {
        localStorage.removeItem(key)
      }
    })
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('sb-') || key.toLowerCase().includes('supabase')) {
        sessionStorage.removeItem(key)
      }
    })
  }

  if (error) {
    throw error
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
