"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useOCR } from "@/hooks/useOCR"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { AppIcon } from "@/components/AppIcon"
import { ocrApi } from "@/lib/api-client"
import { MobileNav } from "@/components/MobileNav"
import { createClient } from "@/utils/supabase/client"
import {
  Upload,
  FileSpreadsheet,
  Image,
  Sparkles,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  X,
  Grid3x3,
  FileImage,
  Zap,
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle2,
  Save,
  DownloadCloud,
  CheckSquare,
  Share2,
  Link,
  Copy,
  Facebook,
  MessageCircle,
  Sheet,
  FolderUp
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
// Removed react-share imports as we're using custom implementations for direct messaging
import { Input } from "@/components/ui/input"
import { useSearchParams } from "next/navigation"
import { PenTool, Monitor, Edit3 } from "lucide-react"
import { wakeUpBackendSilently } from "@/lib/backend-health"

export default function ProcessImagesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const documentType = searchParams.get('type') || 'auto'
  
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedView, setSelectedView] = useState<"grid" | "list">("grid")
  const [credits, setCredits] = useState({ used: 0, total: 80, available: 80 })
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedFileToShare, setSelectedFileToShare] = useState<any>(null)
  const [selectedFilesForBatch, setSelectedFilesForBatch] = useState<any[]>([])
  const [shareSession, setShareSession] = useState<any>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [creditLoading, setCreditLoading] = useState(true)
  const [autoDownload, setAutoDownload] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoDownload')
      return saved === 'true'
    }
    return false
  })
  const [autoSave, setAutoSave] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoSave')
      return saved === 'true'
    }
    return false
  })
  const [showAutoDownloadConfirm, setShowAutoDownloadConfirm] = useState(false)
  const [exportingToSheets, setExportingToSheets] = useState(false)
  const [exportingToDrive, setExportingToDrive] = useState(false)
  const [processingTime, setProcessingTime] = useState(0)
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Track if auto-actions have been executed for current job to prevent duplicates
  const autoActionsExecutedRef = useRef<string | null>(null)
  const isExecutingAutoActionsRef = useRef(false)
  
  // Document type display info
  const documentTypeInfo = {
    handwritten: { label: "Handwritten Tables", icon: PenTool, color: "bg-blue-500" },
    printed: { label: "Printed Tables", icon: Monitor, color: "bg-purple-500" },
    auto: { label: "Auto-Detect", icon: Sparkles, color: "bg-emerald-500" }
  }[documentType as string] || { label: "Auto-Detect", icon: Sparkles, color: "bg-emerald-500" }
  
  // Log environment configuration on mount
  useEffect(() => {
    console.log('[ProcessImagesPage] Environment Configuration:', {
      API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev',
      WS_URL: process.env.NEXT_PUBLIC_WS_URL,
      FB_APP_ID: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    })
  }, [])

  const fetchUserCredits = async () => {
    try {
      // Calculate credits from all processed images (just like dashboard)
      const supabase = createClient()
      const { data: allJobs } = await supabase
        .from('processing_jobs')
        .select('processing_metadata')
        .eq('user_id', user?.id || '')
      
      const typedAllJobs = (allJobs || []) as any[]
      const totalImagesProcessed = typedAllJobs.reduce((sum, job) => 
        sum + (job.processing_metadata?.total_images || 1), 0)

      // Simple credit calculation - 80 total, minus what's been used
      const TOTAL_CREDITS = 80
      const creditsUsed = Math.min(totalImagesProcessed, TOTAL_CREDITS)
      const creditsAvailable = Math.max(0, TOTAL_CREDITS - totalImagesProcessed)
      
      console.log('[ProcessImagesPage] Credits calculated:', {
        totalImagesProcessed,
        creditsUsed,
        creditsAvailable
      })
      
      setCredits({
        used: creditsUsed,
        total: TOTAL_CREDITS,
        available: creditsAvailable
      })
    } catch (error) {
      console.error('Error fetching credits:', error)
      // Set default values on error
      setCredits({
        used: 0,
        total: 80,
        available: 80
      })
    } finally {
      setCreditLoading(false)
    }
  }

  const {
    isProcessing,
    status,
    progress,
    files: resultFiles,
    uploadBatch,
    downloadFile,
    saveToHistory,
    connectWebSocket,
    reset,
    isSaving,
    isSaved,
    jobId
  } = useOCR()

  // Silently wake up backend when page loads
  useEffect(() => {
    wakeUpBackendSilently()
  }, [])

  // Persist auto-download setting to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoDownload', autoDownload.toString())
    }
  }, [autoDownload])

  // Persist auto-save setting to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoSave', autoSave.toString())
    }
  }, [autoSave])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in')
    }
  }, [user, authLoading, router])

  // Fetch user's credit status on mount
  useEffect(() => {
    if (user) {
      console.log('[ProcessImagesPage] Initial credit fetch for user')
      fetchUserCredits()
    }
  }, [user])

  // Refetch credits when processing is complete
  useEffect(() => {
    if (status === 'completed') {
      console.log('[ProcessImagesPage] Processing completed, fetching updated credits')
      // Delay to ensure backend has processed and updated credits
      const timer = setTimeout(() => {
        fetchUserCredits()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [status])

  // Auto-download and auto-save when files are ready
  useEffect(() => {
    // Only run if auto-download or auto-save are enabled
    if (!autoDownload && !autoSave) {
      return
    }

    if (status === 'completed' && resultFiles && resultFiles.length > 0 && jobId) {
      // Check if we've already executed auto-actions for this job
      if (autoActionsExecutedRef.current === jobId) {
        console.log('[AutoActions] Already executed for job:', jobId)
        return
      }

      // Check if auto-actions are currently executing
      if (isExecutingAutoActionsRef.current) {
        console.log('[AutoActions] Already executing, skipping...')
        return
      }

      // Mark this job as processed IMMEDIATELY to prevent duplicate triggers
      autoActionsExecutedRef.current = jobId
      isExecutingAutoActionsRef.current = true

      const handleAutoActions = async () => {
        console.log('[AutoActions] Executing for job:', jobId, 'autoDownload:', autoDownload, 'autoSave:', autoSave)

        try {
          // Auto-download all files
          if (autoDownload) {
            console.log('[AutoDownload] Starting download for', resultFiles.length, 'file(s)')
            toast.info(`Auto-downloading ${resultFiles.length} file(s)...`)

            // Create a Set of downloaded file IDs to prevent duplicates
            const downloadedIds = new Set<string>()

            for (const file of resultFiles) {
              if (file.file_id && !downloadedIds.has(file.file_id)) {
                try {
                  console.log('[AutoDownload] Downloading file:', file.file_id)
                  await downloadFile(file.file_id)
                  downloadedIds.add(file.file_id)
                  await new Promise(resolve => setTimeout(resolve, 500))
                } catch (error) {
                  console.error('[AutoDownload] Failed to download:', file.file_id, error)
                }
              } else if (downloadedIds.has(file.file_id)) {
                console.log('[AutoDownload] Skipping duplicate file_id:', file.file_id)
              }
            }

            toast.success(`Auto-downloaded ${downloadedIds.size} file(s)`)
          }

          // Auto-save to history
          if (autoSave && !isSaved) {
            console.log('[AutoSave] Saving to history automatically')
            await saveToHistory()
            toast.success('Auto-saved to history')
          }
        } finally {
          // Reset execution flag after completion
          isExecutingAutoActionsRef.current = false
        }
      }

      handleAutoActions()
    }
  }, [status, jobId])

  // Reset auto-actions tracker when user starts a new batch
  useEffect(() => {
    if (uploadedFiles.length > 0 && !isProcessing) {
      console.log('[AutoActions] Resetting tracker for new batch')
      autoActionsExecutedRef.current = null
      isExecutingAutoActionsRef.current = false
    }
  }, [uploadedFiles.length, isProcessing])

  // Processing timer
  useEffect(() => {
    if (isProcessing) {
      // Reset and start timer
      setProcessingTime(0)
      processingTimerRef.current = setInterval(() => {
        setProcessingTime(prev => prev + 1)
      }, 1000)
    } else {
      // Stop timer
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current)
        processingTimerRef.current = null
      }
    }

    // Cleanup on unmount
    return () => {
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current)
      }
    }
  }, [isProcessing])

  // Listen for localStorage changes from settings page
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'autoDownload' && e.newValue !== null) {
        setAutoDownload(e.newValue === 'true')
      }
      if (e.key === 'autoSave' && e.newValue !== null) {
        setAutoSave(e.newValue === 'true')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also check on focus in case storage event doesn't fire
    const handleFocus = () => {
      const savedDownload = localStorage.getItem('autoDownload')
      const savedSave = localStorage.getItem('autoSave')
      if (savedDownload !== null) setAutoDownload(savedDownload === 'true')
      if (savedSave !== null) setAutoSave(savedSave === 'true')
    }
    
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    )
    
    setUploadedFiles(prev => {
      const remainingSlots = 100 - prev.length
      const filesToAdd = files.slice(0, remainingSlots)
      return [...prev, ...filesToAdd]
    })
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files).filter(file =>
        file.type.startsWith('image/')
      )
      setUploadedFiles(prev => {
        const remainingSlots = 100 - prev.length
        const filesToAdd = fileArray.slice(0, remainingSlots)
        return [...prev, ...filesToAdd]
      })
    }
  }, [])

  const handleProcessImages = useCallback(async () => {
    if (uploadedFiles.length === 0) return

    // Check if user has enough credits
    const creditsNeeded = uploadedFiles.length
    const creditsAvailable = credits.available
    
    if (creditsAvailable <= 0) {
      toast.error('You have run out of credits. Your credits will reset next month.')
      return
    }
    
    if (creditsNeeded > creditsAvailable) {
      toast.error(`You only have ${creditsAvailable} credits remaining. Remove ${creditsNeeded - creditsAvailable} images to proceed.`)
      return
    }

    try {
      const response = await uploadBatch(uploadedFiles)
      if (response && response.session_id) {
        connectWebSocket(response.session_id)
        // Update credits optimistically after successful upload
        console.log('[ProcessImages] Optimistically updating credits:', {
          before: credits,
          creditsNeeded,
          after: {
            used: credits.used + creditsNeeded,
            available: Math.max(0, credits.available - creditsNeeded)
          }
        })
        setCredits(prev => ({
          ...prev,
          used: prev.used + creditsNeeded,
          available: Math.max(0, prev.available - creditsNeeded)
        }))
        // Credits will be refetched when status becomes 'completed' via useEffect

        toast.success(`Processing ${creditsNeeded} image${creditsNeeded > 1 ? 's' : ''}. ${creditsAvailable - creditsNeeded} credits remaining.`)
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error?.status_code === 402) {
        // Payment required - out of credits
        toast.error('Insufficient credits. Your available credits may have changed. Refreshing...')
        fetchUserCredits() // Refresh credits
      } else if (error?.status_code === 500) {
        // Server error
        toast.error('Server error. Please try again or contact support.')
      } else {
        // Generic error
        toast.error(error?.detail || 'Failed to process images. Please try again.')
      }
      console.error('[ProcessImages] Error:', error)
    }
  }, [uploadedFiles, uploadBatch, connectWebSocket, credits])

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    setUploadedFiles([])
    reset()
    // Reset auto-actions trackers
    autoActionsExecutedRef.current = null
    isExecutingAutoActionsRef.current = false
    console.log('[AutoActions] Trackers reset on New Batch')
  }

  const handleShareFile = async (file: any) => {
    console.log('[Share] Opening share dialog for file:', file)
    
    // Ensure we have a valid file_id
    if (!file || !file.file_id) {
      console.error('[Share] Invalid file object:', file)
      toast.error('Unable to share: File information is missing')
      return
    }
    
    setSelectedFileToShare(file)
    setShareDialogOpen(true)
    setCopySuccess(false)
  }
  
  const handleCopyLink = async () => {
    if (!selectedFileToShare?.file_id) {
      console.error('[Copy] No file selected or file_id missing')
      toast.error('Unable to copy link: File information is missing')
      return
    }
    
    // Clean the base URL to ensure no whitespace
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()
    
    let shareContent = ''
    
    // Check if this is a session-based batch share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      console.log('[Copy] Copying session share URL:', shareSession.share_url)
      shareContent = shareSession.share_url
    } 
    // Legacy batch share (fallback)
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      console.log('[Copy] Copying batch download links for', selectedFilesForBatch.length, 'files')
      
      // Generate links for all files
      const links = selectedFilesForBatch.map((file, index) => {
        const fileUrl = `${baseUrl}/api/v1/download/${file.file_id}`.replace(/\s/g, '')
        return `File ${index + 1} (${file.filename || 'result.xlsx'}): ${fileUrl}`
      }).join('\n')
      
      shareContent = `Download links for ${selectedFilesForBatch.length} Excel files:\n\n${links}`
    } 
    // Single file share
    else {
      const shareUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '')
      shareContent = shareUrl
    }
    
    console.log('[Copy] Copying content:', shareContent)
    
    try {
      await navigator.clipboard.writeText(shareContent)
      setCopySuccess(true)
      const message = selectedFileToShare.file_id === '__BATCH__' 
        ? `Links for ${selectedFilesForBatch.length} files copied!`
        : 'Download link copied to clipboard'
      toast.success(message)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('[Copy] Failed to copy link:', error)
      toast.error('Failed to copy link to clipboard')
    }
  }
  
  // Custom share handlers
  // Share handlers for direct messaging (not social media posts)
  const handleMessengerShare = () => {
    if (!selectedFileToShare?.file_id) {
      console.error('[Share] No file selected for Messenger share')
      return
    }
    
    console.log('[Share] Messenger share initiated for file:', selectedFileToShare)
    
    // Clean the base URL to remove any newlines or whitespace
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()
    
    // For batch sharing, create a message with all links
    let shareUrl = ''
    
    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareUrl = shareSession.share_url.replace(/\s/g, '')
      console.log('[Share] Session share via Messenger:', shareUrl)
    } 
    // Legacy batch share
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      // For Messenger, we can only share one link at a time, so create a landing page URL
      // For now, we'll share the first file and indicate there are more
      shareUrl = `${baseUrl}/api/v1/download/${selectedFilesForBatch[0].file_id}`.replace(/\s/g, '')
      console.log('[Share] Batch share via Messenger - sharing first file with note about multiple files')
    } 
    // Single file share
    else {
      shareUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '')
    }
    
    console.log('[Share] Clean Messenger share URL:', shareUrl)
    
    // Get app ID from environment or use default
    const appId = (process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '140586622674265').replace(/"/g, '').trim()
    
    // Facebook Messenger Send Dialog for desktop/web
    // Note: This opens the send dialog, not the share dialog
    const currentUrl = window.location.origin
    const messengerUrl = `https://www.facebook.com/dialog/send?app_id=${appId}&link=${encodeURIComponent(shareUrl)}&redirect_uri=${encodeURIComponent(currentUrl)}`
    
    console.log('[Share] Opening Messenger dialog with app_id:', appId)
    console.log('[Share] Full Messenger URL:', messengerUrl)
    
    // Try to open in popup first
    const popup = window.open(messengerUrl, 'messenger-share-dialog', 'width=600,height=500')
    
    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
      console.warn('[Share] Popup blocked, opening in new tab')
      // Fallback: open in new tab
      window.open(messengerUrl, '_blank')
    }
    
    // Show note for batch sharing
    if (selectedFileToShare.file_id === '__BATCH__') {
      toast.info(`Note: Sharing first of ${selectedFilesForBatch.length} files. Copy all links for complete batch.`, {
        duration: 5000
      })
    }
  }
  
  const handleEmailShare = () => {
    if (!selectedFileToShare?.file_id) {
      console.error('[Share] No file selected for email share')
      return
    }
    
    console.log('[Share] Email share initiated for file:', selectedFileToShare)
    
    // Clean the base URL to ensure no whitespace
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()
    
    let subject = ''
    let body = ''
    
    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      subject = `${selectedFilesForBatch.length} Excel files processed with Exceletto`
      
      const sessionUrl = shareSession.share_url.replace(/\s/g, '')
      
      body = `Hi,

I've processed ${selectedFilesForBatch.length} files with Exceletto. You can download all files from this link:

${sessionUrl}

Best regards`
    }
    // Legacy batch sharing
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      subject = `${selectedFilesForBatch.length} Excel files processed with Exceletto`
      
      const fileLinks = selectedFilesForBatch.map((file, index) => {
        const fileUrl = `${baseUrl}/api/v1/download/${file.file_id}`.replace(/\s/g, '')
        return `File ${index + 1} (${file.filename || 'result.xlsx'}): ${fileUrl}`
      }).join('\n')
      
      body = `Hi,

I've processed ${selectedFilesForBatch.length} files with Exceletto. You can download them here:

${fileLinks}

Best regards`
    } else {
      // Single file
      const shareUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '')
      subject = `Excel file: ${selectedFileToShare.filename || 'Processed with Exceletto'}`
      body = `Hi,

I've processed this file with Exceletto. You can download it here:

${shareUrl}

Best regards`
    }
    
    console.log('[Share] Email share subject:', subject)
    
    // Gmail compose URL with parameters
    // This opens Gmail in a new tab with the compose window pre-filled
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    console.log('[Share] Opening Gmail compose:', gmailUrl)
    
    // Open Gmail compose in new tab
    const gmailWindow = window.open(gmailUrl, '_blank')
    
    if (!gmailWindow) {
      console.warn('[Share] Gmail popup blocked, trying mailto fallback')
      // Fallback to mailto if popup is blocked
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.location.href = mailtoUrl
    }
  }
  
  const handleLinkedInMessage = () => {
    if (!selectedFileToShare?.file_id) {
      console.error('[Share] No file selected for LinkedIn share')
      return
    }
    
    console.log('[Share] LinkedIn message initiated for file:', selectedFileToShare)
    
    // Clean the base URL to ensure no whitespace
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()
    
    let shareContent = ''
    
    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareContent = shareSession.share_url.replace(/\s/g, '')
      console.log('[Share] Session share for LinkedIn:', shareContent)
    }
    // Legacy batch sharing
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      const fileLinks = selectedFilesForBatch.map((file, index) => {
        const fileUrl = `${baseUrl}/api/v1/download/${file.file_id}`.replace(/\s/g, '')
        return `File ${index + 1} (${file.filename || 'result.xlsx'}): ${fileUrl}`
      }).join('\n')
      
      shareContent = `Download links for ${selectedFilesForBatch.length} Excel files:\n\n${fileLinks}`
    } 
    // Single file
    else {
      const shareUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '')
      shareContent = shareUrl
    }
    
    console.log('[Share] LinkedIn share content:', shareContent)
    
    // LinkedIn doesn't support direct message URLs with pre-filled content
    // Best approach: Copy link and show instructions
    navigator.clipboard.writeText(shareContent)
      .then(() => {
        console.log('[Share] Link copied to clipboard successfully')
        
        // Show detailed instructions
        const isBatch = selectedFileToShare.file_id === '__BATCH__'
        const message = isBatch 
          ? `${selectedFilesForBatch.length} file links copied to clipboard!`
          : 'Link copied to clipboard!'
        toast.success(message, {
          duration: 8000,
          description: 'Opening LinkedIn... Click "New message" → Choose recipient → Paste the links (Ctrl+V or Cmd+V)'
        })
        
        // Open LinkedIn messaging compose page
        // This URL opens the messaging page with compose view
        window.open('https://www.linkedin.com/messaging/compose/', '_blank')
      })
      .catch((err) => {
        console.error('[Share] Failed to copy link:', err)
        // Fallback: show the link for manual copying
        const fallbackInput = document.createElement('input')
        fallbackInput.value = shareContent
        document.body.appendChild(fallbackInput)
        fallbackInput.select()
        document.execCommand('copy')
        document.body.removeChild(fallbackInput)
        
        toast.success('Link copied! Opening LinkedIn...', {
          duration: 6000
        })
        window.open('https://www.linkedin.com/messaging/compose/', '_blank')
      })
  }

  const handleXShare = () => {
    if (!selectedFileToShare?.file_id) {
      console.error('[Share] No file selected for X (Twitter) share')
      return
    }
    
    console.log('[Share] X (Twitter) share initiated for file:', selectedFileToShare)
    
    // Clean the base URL to ensure no whitespace
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()
    
    let tweetText = ''
    let shareUrl = ''
    
    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareUrl = shareSession.share_url.replace(/\s/g, '')
      tweetText = `Check out these ${selectedFilesForBatch.length} Excel files I processed with Exceletto! 📊✨`
      console.log('[Share] Session share via X:', shareUrl)
    }
    // Legacy batch sharing
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      // For batch, use the first file URL as example
      shareUrl = `${baseUrl}/api/v1/download/${selectedFilesForBatch[0].file_id}`.replace(/\s/g, '')
      tweetText = `Check out these ${selectedFilesForBatch.length} Excel files I processed with Exceletto! 📊✨`
    }
    // Single file
    else {
      shareUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '')
      tweetText = `Check out this Excel file I processed with Exceletto! 📊✨`
    }
    
    // X (Twitter) Web Intent URL
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`
    
    console.log('[Share] Opening X share dialog:', xUrl)
    
    window.open(xUrl, '_blank', 'width=550,height=420')
    
    toast.success('X share window opened!', {
      description: 'Customize your tweet and share with your followers'
    })
  }

  const handleShareAll = async () => {
    console.log('[ShareAll] Sharing batch with jobId:', jobId, 'files:', resultFiles)
    
    if (!jobId || !resultFiles || resultFiles.length === 0) {
      console.error('[ShareAll] Invalid batch data:', { jobId, resultFiles })
      toast.error('Unable to share batch: No files available')
      return
    }
    
    // Get all valid file IDs
    const allFileIds = resultFiles.map(f => f.file_id).filter(Boolean)
    
    if (allFileIds.length === 0) {
      console.error('[ShareAll] No valid file IDs found')
      toast.error('Unable to share: No valid files found')
      return
    }
    
    try {
      // Create a share session for all files
      console.log('[ShareAll] Creating share session for', allFileIds.length, 'files')
      
      const sessionResponse = await ocrApi.createShareSession({
        file_ids: allFileIds,
        title: `Batch of ${resultFiles.length} Excel files`,
        description: `Processed on ${new Date().toLocaleDateString()}`,
        expires_in_days: 7
      })
      
      console.log('[ShareAll] Session created:', sessionResponse)
      
      // Store session info
      setShareSession(sessionResponse)
      setSelectedFilesForBatch(resultFiles)
      
      // Open share dialog with session info
      setSelectedFileToShare({
        file_id: '__SESSION__',
        filename: `Batch of ${resultFiles.length} Excel files`,
        isBatch: true,
        sessionId: sessionResponse.session_id
      })
      
      setShareDialogOpen(true)
      setCopySuccess(false)
      
      toast.success('Share link created successfully!')
      
    } catch (error: any) {
      console.error('[ShareAll] Failed to create share session:', error)
      console.error('[ShareAll] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to create share link'
      toast.error(`Error: ${errorMessage}`)
    }
  }

  const handleExportToGoogleSheets = async () => {
    if (!resultFiles || resultFiles.length === 0) {
      toast.error('No files to export')
      return
    }

    setExportingToSheets(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Please sign in to export to Google Sheets')
        setExportingToSheets(false)
        return
      }

      // Google Sheets API requires OAuth scope
      // We'll use the Google Picker API to let users create/select a sheet
      toast.info('Opening Google Sheets...', {
        description: `Exporting ${resultFiles.length} file(s)`
      })

      // For each file, download it and open a new Google Sheets tab
      for (const file of resultFiles) {
        if (!file.file_id) continue

        // Create a link to open Google Sheets with import
        const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev'}/api/v1/download/${file.file_id}`

        // Open Google Sheets with file import
        const sheetsUrl = `https://docs.google.com/spreadsheets/create`
        window.open(sheetsUrl, '_blank')

        // Show instructions
        toast.success(`Google Sheets opened for ${file.filename}`, {
          description: 'Use File → Import → Upload to import your Excel file'
        })

        // Small delay between opening tabs
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

    } catch (error: any) {
      console.error('[ExportToSheets] Error:', error)
      toast.error('Failed to export to Google Sheets', {
        description: error.message
      })
    } finally {
      setExportingToSheets(false)
    }
  }

  const handleExportToGoogleDrive = async () => {
    if (!resultFiles || resultFiles.length === 0) {
      toast.error('No files to export')
      return
    }

    setExportingToDrive(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Please sign in to export to Google Drive')
        setExportingToDrive(false)
        return
      }

      toast.info('Preparing files for Google Drive...', {
        description: `Exporting ${resultFiles.length} file(s)`
      })

      // Open Google Drive upload page
      const driveUploadUrl = 'https://drive.google.com/drive/my-drive'
      window.open(driveUploadUrl, '_blank')

      // Download all files locally first (they can then upload to Drive)
      for (const file of resultFiles) {
        if (!file.file_id) continue
        await downloadFile(file.file_id)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      toast.success('Files downloaded!', {
        description: 'Now upload them to Google Drive from the opened tab'
      })

    } catch (error: any) {
      console.error('[ExportToDrive] Error:', error)
      toast.error('Failed to export to Google Drive', {
        description: error.message
      })
    } finally {
      setExportingToDrive(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isComplete = status === 'completed' && resultFiles && resultFiles.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="border-b lg:block hidden">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AppIcon size={32} />
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white border-2 border-primary shadow-sm">
                <documentTypeInfo.icon className="h-4 w-4 text-primary" />
                <h1 className="text-sm font-semibold text-foreground">{documentTypeInfo.label}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/upload-type')}
              >
                Change Type
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="gap-1.5"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="lg:hidden border-b bg-background sticky top-0 z-40">
        <div className="container max-w-5xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white dark:bg-white border-2 border-primary shadow-sm">
              <documentTypeInfo.icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">{documentTypeInfo.label}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/upload-type')}
            >
              Change
            </Button>
          </div>
        </div>
      </div>

      <main className="container max-w-5xl mx-auto px-4 py-8 pb-24">
        {/* Status Bar */}
        {isProcessing && !isComplete && (
          <Alert className="mb-6 border-2 border-primary bg-primary">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <span className="font-medium text-white">Processing your images...</span>
                  {progress && (
                    <span className="ml-3 text-sm text-white/80">
                      {progress.processed_images} of {progress.total_images} completed
                    </span>
                  )}
                </div>
                <Badge variant="secondary" className="gap-1.5 bg-white text-primary">
                  <Clock className="h-3 w-3" />
                  <span>{processingTime}s</span>
                </Badge>
              </div>
              {progress && (
                <span className="text-sm font-medium text-white">{progress.percentage}%</span>
              )}
            </AlertDescription>
            {progress && (
              <Progress value={progress.percentage} className="mt-2" />
            )}
          </Alert>
        )}

        {isComplete && (
          <Alert className="mb-6 border-2 border-primary bg-primary">
            <CheckCircle className="h-4 w-4 text-white" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium text-white">
                  Processing complete! Your files are ready.
                </span>
                {processingTime > 0 && (
                  <Badge variant="outline" className="gap-1.5 text-white border-white bg-transparent">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Completed in {processingTime}s</span>
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {!isSaved && (
                  <Button
                    size="sm"
                    onClick={saveToHistory}
                    disabled={isSaving}
                    className="bg-white text-primary hover:bg-white/90 border-0"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>Save to History</>
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleReset}
                  className="bg-white text-primary hover:bg-white/90 border-0"
                >
                  Start Fresh
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {!isComplete ? (
              <>
                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "relative border-2 border-dashed rounded-lg transition-all duration-200",
                    isDragging 
                      ? "border-primary bg-primary/5 scale-[0.99]" 
                      : "border-border hover:border-primary/50",
                    uploadedFiles.length > 0 ? "p-3 sm:p-4" : "p-6 sm:p-8 lg:p-12"
                  )}
                >
                  {uploadedFiles.length === 0 ? (
                    <div className="text-center">
                      <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-sm sm:text-base font-medium mb-1">
                        {isDragging ? "Drop your images here" : "Upload table images"}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        Drag & drop or click to browse • Max 100 images
                      </p>
                      <label htmlFor="file-upload">
                        <Button asChild>
                          <span>
                            <FileImage className="h-4 w-4 mr-2" />
                            Select Images
                          </span>
                        </Button>
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div>
                      {/* File Count Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="gap-1">
                            <Image className="h-3 w-3" />
                            {uploadedFiles.length} {uploadedFiles.length === 1 ? 'image' : 'images'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Ready to process
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setUploadedFiles([])}
                          >
                            Clear all
                          </Button>
                          <label htmlFor="file-upload-more">
                            <Button size="sm" variant="outline" asChild>
                              <span>Add more</span>
                            </Button>
                          </label>
                          <input
                            id="file-upload-more"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileInput}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* File Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[400px] overflow-y-auto">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="relative group aspect-square rounded-lg overflow-hidden border bg-card"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleRemoveFile(index)}
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                              <p className="text-[10px] text-white truncate">
                                {file.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Process Button */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Credits:</span>
                      <Badge 
                        variant={credits.available <= 10 ? "destructive" : "secondary"}
                        className="gap-1"
                      >
                        {credits.available} / {credits.total} remaining
                      </Badge>
                      {uploadedFiles.length > credits.available && (
                        <span className="text-xs text-destructive">
                          Not enough credits!
                        </span>
                      )}
                    </div>
                    <Button
                      size="lg"
                      onClick={handleProcessImages}
                      disabled={isProcessing || (credits.available < uploadedFiles.length)}
                      className="gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Process All Images
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : null}

            {/* Progressive Results Section - Show files as they become ready */}
            {(isProcessing || isComplete) && resultFiles && resultFiles.length > 0 && (
              <TooltipProvider>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Ready Files</h2>
                    {isProcessing && (
                      <Badge variant="secondary" className="gap-1 animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Processing more...
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <FileSpreadsheet className="h-3 w-3" />
                      {resultFiles.length} of {progress?.total_images || uploadedFiles.length} ready
                    </Badge>
                    {resultFiles.length > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleShareAll}
                          className="gap-2"
                        >
                          <Share2 className="h-4 w-4" />
                          Share All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            console.log('[DownloadAll] Starting batch download:', resultFiles)
                            toast.info(`Downloading ${resultFiles.length} files...`)

                            let downloadCount = 0
                            for (const file of resultFiles) {
                              if (!file.file_id) {
                                console.error('[DownloadAll] Skipping file without ID:', file)
                                continue
                              }

                              try {
                                console.log(`[DownloadAll] Downloading ${downloadCount + 1}/${resultFiles.length}:`, file.file_id)
                                await downloadFile(file.file_id)
                                downloadCount++
                                await new Promise(resolve => setTimeout(resolve, 500))
                              } catch (error) {
                                console.error('[DownloadAll] Failed to download file:', file.file_id, error)
                                toast.error(`Failed to download ${file.filename || 'file'}`)
                              }
                            }

                            if (downloadCount === resultFiles.length) {
                              toast.success(`Successfully downloaded ${downloadCount} files`)
                            } else if (downloadCount > 0) {
                              toast.warning(`Downloaded ${downloadCount} of ${resultFiles.length} files`)
                            } else {
                              toast.error('Failed to download any files')
                            }
                          }}
                          className="gap-2"
                        >
                          <DownloadCloud className="h-4 w-4" />
                          Download All
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleExportToGoogleSheets}
                          disabled={exportingToSheets}
                          className="gap-2 bg-primary text-white hover:bg-primary/90 border-0"
                        >
                          {exportingToSheets ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sheet className="h-4 w-4" />
                          )}
                          Sheets
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleExportToGoogleDrive}
                          disabled={exportingToDrive}
                          className="gap-2 bg-primary text-white hover:bg-primary/90 border-0"
                        >
                          {exportingToDrive ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FolderUp className="h-4 w-4" />
                          )}
                          Drive
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {resultFiles.map((file: any, index: number) => (
                    <Card 
                      key={file.file_id || index} 
                      className="overflow-hidden animate-in slide-in-from-bottom-2 duration-300"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                              <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="font-medium text-sm truncate cursor-default">
                                    {file.filename || `Image ${index + 1} Result`}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs break-all">{file.filename || `Image ${index + 1} Result`}</p>
                                </TooltipContent>
                              </Tooltip>
                              <div className="flex items-center gap-2 mt-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <p className="text-xs text-muted-foreground">
                                  Ready to download
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleShareFile(file)}
                              className="gap-1.5"
                            >
                              <Share2 className="h-4 w-4" />
                              <span className="sr-only">Share</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                router.push(`/dashboard/edit/${file.file_id}?fileName=${encodeURIComponent(file.filename || 'Result.xlsx')}`)
                              }}
                              className="gap-1.5"
                            >
                              <Edit3 className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                console.log('[Download] Downloading file:', file)
                                if (!file.file_id) {
                                  toast.error('Unable to download: File ID is missing')
                                  return
                                }
                                downloadFile(file.file_id)
                              }}
                              className="gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              </TooltipProvider>
            )}
          </div>

          {/* Info Sidebar - Shows first on mobile */}
          <div className="lg:col-span-1 space-y-4 order-1 lg:order-2">
            {/* Auto Settings */}
            <Card className="bg-white dark:bg-white border-2 border-primary shadow-lg shadow-primary/10">
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-3 text-foreground">Auto Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (!autoDownload) {
                        // Show confirmation when enabling
                        setShowAutoDownloadConfirm(true)
                      } else {
                        // Disable directly without confirmation
                        setAutoDownload(false)
                      }
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-lg transition-all",
                      "border-2 hover:border-primary/50",
                      autoDownload
                        ? "bg-primary/10 border-primary"
                        : "bg-muted/30 border-muted-foreground/20"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <DownloadCloud className={cn(
                        "h-4 w-4",
                        autoDownload ? "text-primary" : "text-muted-foreground"
                      )} />
                      <Label htmlFor="auto-download" className="text-xs font-medium text-foreground cursor-pointer">
                        Auto Download
                      </Label>
                    </div>
                    <Switch
                      id="auto-download"
                      checked={autoDownload}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setShowAutoDownloadConfirm(true)
                        } else {
                          setAutoDownload(false)
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="data-[state=checked]:bg-primary"
                    />
                  </button>

                  <button
                    onClick={() => setAutoSave(!autoSave)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-lg transition-all",
                      "border-2 hover:border-primary/50",
                      autoSave
                        ? "bg-primary/10 border-primary"
                        : "bg-muted/30 border-muted-foreground/20"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Save className={cn(
                        "h-4 w-4",
                        autoSave ? "text-primary" : "text-muted-foreground"
                      )} />
                      <Label htmlFor="auto-save" className="text-xs font-medium text-foreground cursor-pointer">
                        Auto Save
                      </Label>
                    </div>
                    <Switch
                      id="auto-save"
                      checked={autoSave}
                      onCheckedChange={setAutoSave}
                      onClick={(e) => e.stopPropagation()}
                      className="data-[state=checked]:bg-primary"
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white dark:bg-white border-2 border-primary shadow-lg shadow-primary/10">
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2 text-foreground">Quick Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={
                      isComplete ? "default" :
                      isProcessing ? "secondary" :
                      "outline"
                    } className="text-xs px-2 py-0">
                      {isComplete ? "Complete" :
                       isProcessing ? "Processing" :
                       "Ready"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Images</span>
                    <span className="font-medium">{uploadedFiles.length}</span>
                  </div>
                  {isProcessing && progress && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress.percentage}%</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="bg-white dark:bg-white border-2 border-primary shadow-lg shadow-primary/10">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                  <div className="text-xs text-foreground">
                    <p className="mb-1 font-medium">Supported formats:</p>
                    <p className="text-[11px] text-muted-foreground">PNG, JPG, JPEG, WebP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={(open) => {
        console.log('[ShareDialog] Dialog state changed:', open)
        if (open && selectedFileToShare) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev'
          if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
            console.log('[ShareDialog] Session share:', shareSession)
          } else if (selectedFileToShare.file_id === '__BATCH__') {
            console.log('[ShareDialog] Batch share for', selectedFilesForBatch.length, 'files')
          } else {
            const downloadUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`
            console.log('[ShareDialog] File to share:', selectedFileToShare)
            console.log('[ShareDialog] Download URL:', downloadUrl)
          }
        }
        
        // Clean up when closing
        if (!open) {
          setSelectedFilesForBatch([])
          setShareSession(null)
          setCopySuccess(false)
        }
        
        setShareDialogOpen(open)
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {selectedFileToShare?.isBatch ? 'Share All Files' : 'Share File'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {selectedFileToShare?.file_id === '__SESSION__' && shareSession
                ? `Share ${selectedFilesForBatch.length} Excel files with a single link` 
                : selectedFileToShare?.isBatch 
                ? `Share ${selectedFilesForBatch.length} Excel files - Each file has its own download link` 
                : selectedFileToShare?.filename || 'Excel file'}
              {shareSession && shareSession.expires_at && (
                <span className="block mt-1 text-xs text-muted-foreground">
                  Link expires on {new Date(shareSession.expires_at).toLocaleDateString()}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Direct Message Share Options - Send to friends, not posting on social media */}
            <div className="space-y-3">
              <p className="text-xs text-center text-muted-foreground">Share your download link:</p>
              <div className="flex justify-center gap-4">
                {/* Gmail */}
                <button
                  onClick={handleEmailShare}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title="Compose email in Gmail"
                >
                  <svg className="h-10 w-10 text-[#EA4335] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                  </svg>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Gmail</span>
                </button>

                {/* LinkedIn Message */}
                <button
                  onClick={handleLinkedInMessage}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title="Copy link and compose LinkedIn message"
                >
                  <svg className="h-10 w-10 text-[#0077B5] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">LinkedIn</span>
                </button>

                {/* X (Twitter) */}
                <button
                  onClick={handleXShare}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title="Share on X (Twitter)"
                >
                  <svg className="h-10 w-10 text-foreground group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">X</span>
                </button>

                {/* Facebook Messenger */}
                <button
                  onClick={handleMessengerShare}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title="Send via Facebook Messenger"
                >
                  <MessageCircle className="h-10 w-10 text-[#0084FF] group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Messenger</span>
                </button>
              </div>
              {selectedFileToShare && (
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-muted-foreground/70">
                    {selectedFileToShare.filename || 'Excel file'} ready to share
                  </p>
                  <p className="text-[9px] text-muted-foreground/50">
                    Gmail: Compose email • LinkedIn: Copy & paste • X: Tweet • Messenger: Direct message
                  </p>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            
            {/* Direct Download Link */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link className="h-3.5 w-3.5" />
                <span className="font-medium">Direct download link</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={(() => {
                    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()
                    
                    // Handle batch share display
                    if (selectedFileToShare?.file_id === '__BATCH__' && selectedFilesForBatch?.length > 0) {
                      return `Multiple files (${selectedFilesForBatch.length} links) - Click copy to get all`
                    }
                    
                    const fileId = selectedFileToShare?.file_id || ''
                    return fileId && fileId !== '__BATCH__' ? `${baseUrl}/api/v1/download/${fileId}`.replace(/\s/g, '') : ''
                  })()}
                  className="text-xs h-9 bg-muted/50 border-muted-foreground/20"
                />
                <Button
                  size="sm"
                  variant={copySuccess ? "default" : "outline"}
                  onClick={handleCopyLink}
                  className="h-9 px-3"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      <span className="text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Anyone with this link can download the Excel file directly
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto-Download Confirmation Dialog */}
      <Dialog open={showAutoDownloadConfirm} onOpenChange={setShowAutoDownloadConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <DialogTitle>Enable Auto-Download?</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              When enabled, all processed files will be automatically downloaded to your device as soon as they're ready.
              <br /><br />
              This means files will download immediately without asking for permission each time.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowAutoDownloadConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAutoDownload(true)
                setShowAutoDownloadConfirm(false)
              }}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Enable Auto-Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Navigation */}
      <MobileNav
        isAuthenticated={true}
        user={{
          email: user?.email,
          name: user?.user_metadata?.full_name
        }}
      />
    </div>
  )
}
