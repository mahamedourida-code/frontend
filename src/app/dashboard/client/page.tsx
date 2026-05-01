"use client"

import { Suspense, useState, useCallback, useEffect, useRef } from "react"
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
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar"
import Image from "next/image"
import {
  Upload,
  FileSpreadsheet,
  Image as ImageIcon,
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
  ChevronLeft,
  FolderUp,
  Activity,
  History
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
import { useProcessingState } from "@/contexts/ProcessingStateContext"
import * as XLSX from 'xlsx'

function ProcessImagesFallback() {
  return (
    <div className="min-h-screen bg-[#FFF9E7] p-3 sm:p-4">
      <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center rounded-[30px] border border-[#eadfff] bg-white/55 backdrop-blur-xl">
        <div className="h-12 w-12 rounded-full border-4 border-[#d9c9fb] border-t-[#2f165e] animate-spin" />
      </div>
    </div>
  )
}

export default function ProcessImagesPage() {
  return (
    <Suspense fallback={<ProcessImagesFallback />}>
      <ProcessImagesContent />
    </Suspense>
  )
}

function ProcessImagesContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const documentType = searchParams.get('type') || 'auto'
  const languageParam = searchParams.get('language') || (typeof window !== 'undefined' ? localStorage.getItem('ocrLanguage') || 'en' : 'en')
  
  // Get state management from context
  const { state: processingState, updateState, clearState } = useProcessingState()

  const [selectedLanguage, setSelectedLanguage] = useState(languageParam)

  // Sync language with localStorage and listen for changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('ocrLanguage')
      if (savedLanguage && savedLanguage !== selectedLanguage) {
        setSelectedLanguage(savedLanguage)
      }
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ocrLanguage' && e.newValue) {
        setSelectedLanguage(e.newValue)
        const params = new URLSearchParams(searchParams.toString())
        params.set('language', e.newValue)
        router.push(`/dashboard/client?${params.toString()}`)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [searchParams, router])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [filePreviewUrls, setFilePreviewUrls] = useState<{[key: number]: string}>({})
  const [selectedView, setSelectedView] = useState<"grid" | "list">("grid")
  const [processedCount, setProcessedCount] = useState(0)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedFileToShare, setSelectedFileToShare] = useState<any>(null)
  const [selectedFilesForBatch, setSelectedFilesForBatch] = useState<any[]>([])
  const [shareSession, setShareSession] = useState<any>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [creditLoading, setCreditLoading] = useState(false) // Start with false, set to true when fetching
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

  const [processingTime, setProcessingTime] = useState(0)
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState<string>("")
  const [renamedFiles, setRenamedFiles] = useState<{[key: string]: string}>({})
  const [tablePreviewData, setTablePreviewData] = useState<any[][]>([])
  const [firstImageUrl, setFirstImageUrl] = useState<string>('')

  // Track if auto-actions have been executed for current job to prevent duplicates
  const autoActionsExecutedRef = useRef<string | null>(null)
  const isExecutingAutoActionsRef = useRef(false)

  // Helper function to remove _processed from filename
  const cleanFilename = (filename: string | undefined): string => {
    if (!filename) return 'result.xlsx';
    return filename.replace('_processed', '');
  };
  
  // Document type removed from UI

  const fetchUserStats = async () => {
    if (!user?.id) {
      setCreditLoading(false)
      return
    }

    try {
      const credits = await ocrApi.getUserCredits()
      const totalProcessed = credits.used_credits || 0
      setProcessedCount(totalProcessed)
      
      
    } catch (error) {
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

  // Restore state from context on mount
  useEffect(() => {
    if (processingState && processingState.processedFiles.length > 0) {
      
      // Note: We can't directly set resultFiles as it's managed by useOCR hook
      // The state will be persisted at the application level
      // Users can see their previous results when they navigate back
    }
  }, [])

  // Save state to context when it changes
  useEffect(() => {
    if (resultFiles && (resultFiles.length > 0 || isProcessing)) {
      updateState({
        processedFiles: resultFiles,
        status: status === 'completed' ? 'completed' : isProcessing ? 'processing' : 'idle',
        processingComplete: status === 'completed',
        uploadedFiles: [] // Don't save File objects
      })
    }
  }, [resultFiles, isProcessing, status, updateState])

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
      router.push('/')
    }
  }, [user, authLoading, router])

  // Fetch user's credit status on mount and periodically refresh
  useEffect(() => {
    // Only fetch once when user is loaded
    if (!authLoading && user?.id) {
      setCreditLoading(true)
      fetchUserStats()
    } else if (!authLoading && !user) {
      setCreditLoading(false)
    }
  }, [user?.id, authLoading])

  // Don't refetch credits after completion - they were already deducted at start
  // Remove this useEffect that was causing the revert issue
  // Credits are deducted when processing starts, not when it completes

  // Auto-download and auto-save when files are ready
  useEffect(() => {
    // Only run if auto-download or auto-save are enabled
    if (!autoDownload && !autoSave) {
      return
    }

    if (status === 'completed' && resultFiles && resultFiles.length > 0 && jobId) {
      // Check if we've already executed auto-actions for this job
      if (autoActionsExecutedRef.current === jobId) {
        return
      }

      // Check if auto-actions are currently executing
      if (isExecutingAutoActionsRef.current) {
        return
      }

      // Mark this job as processed IMMEDIATELY to prevent duplicate triggers
      autoActionsExecutedRef.current = jobId
      isExecutingAutoActionsRef.current = true

      const handleAutoActions = async () => {

        try {
          // Fetch table preview for the first file
          if (resultFiles.length > 0 && resultFiles[0].file_id && tablePreviewData.length === 0) {
            fetchTablePreview(resultFiles[0].file_id)
          }

          // Auto-download all files
          if (autoDownload) {
            // toast.info(`Auto-downloading ${resultFiles.length} file(s)...`)

            // Create a Set of downloaded file IDs to prevent duplicates
            const downloadedIds = new Set<string>()

            for (const file of resultFiles) {
              if (file.file_id && !downloadedIds.has(file.file_id)) {
                try {
                  await downloadFile(file.file_id)
                  downloadedIds.add(file.file_id)
                  await new Promise(resolve => setTimeout(resolve, 500))
                } catch (error) {
                }
              } else if (downloadedIds.has(file.file_id)) {
              }
            }

            // toast.success(`Auto-downloaded ${downloadedIds.size} file(s)`)
          }

          // Auto-save to history
          if (autoSave && !isSaved) {
            await saveToHistory()
            // toast.success('Auto-saved to history')
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

  // Helper function to create preview URL for file (converts HEIC if needed)
  const createFilePreviewUrl = useCallback(async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase()
    const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif')
    
    if (isHeic) {
      try {
        const { default: heic2any } = await import("heic2any")
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        })
        
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
        return URL.createObjectURL(blob)
      } catch (error) {
        return URL.createObjectURL(file)
      }
    }
    
    return URL.createObjectURL(file)
  }, [])

  // Update preview URLs when files change
  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviewUrls: {[key: number]: string} = {}
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        if (!filePreviewUrls[i]) {
          const url = await createFilePreviewUrl(file)
          newPreviewUrls[i] = url
        } else {
          newPreviewUrls[i] = filePreviewUrls[i]
        }
      }
      
      setFilePreviewUrls(newPreviewUrls)
    }
    
    if (uploadedFiles.length > 0) {
      generatePreviews()
    } else {
      Object.values(filePreviewUrls).forEach(url => URL.revokeObjectURL(url))
      setFilePreviewUrls({})
    }
  }, [uploadedFiles.length])

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

    const files = Array.from(e.dataTransfer.files).filter(file => {
      // Accept any file with image MIME type
      if (file.type && file.type.startsWith('image/')) return true
      
      // Accept HEIC/HEIF files regardless of MIME type
      const fileName = file.name.toLowerCase()
      if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) return true
      
      // Accept common image extensions even without MIME type
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
      return imageExtensions.some(ext => fileName.endsWith(ext))
    })
    
    setUploadedFiles(prev => {
      const remainingSlots = 100 - prev.length
      const filesToAdd = files.slice(0, remainingSlots)
      return [...prev, ...filesToAdd]
    })
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files).filter(file => {
        // Accept any file with image MIME type
        if (file.type && file.type.startsWith('image/')) return true
        
        // Accept HEIC/HEIF files regardless of MIME type
        const fileName = file.name.toLowerCase()
        if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) return true
        
        // Accept common image extensions even without MIME type
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
        return imageExtensions.some(ext => fileName.endsWith(ext))
      })
      setUploadedFiles(prev => {
        const remainingSlots = 100 - prev.length
        const filesToAdd = fileArray.slice(0, remainingSlots)
        return [...prev, ...filesToAdd]
      })
    }
  }, [])

  const handleProcessImages = useCallback(async () => {
    if (uploadedFiles.length === 0) return

    const imagesCount = uploadedFiles.length

    try {
      // Store the first uploaded image for preview immediately
      if (uploadedFiles.length > 0) {
        const firstFile = uploadedFiles[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          setFirstImageUrl(e.target?.result as string)
        }
        reader.readAsDataURL(firstFile)
      }

      const response = await uploadBatch(uploadedFiles)
      if (response && response.session_id) {
        connectWebSocket(response.session_id)
        
        // Update counts optimistically
        setProcessedCount(prev => prev + imagesCount)
        
        // Refresh stats after a delay
        setTimeout(() => {
          fetchUserStats()
        }, 2000)

        // toast.success(`Processing ${imagesCount} image${imagesCount > 1 ? 's' : ''}...`)
      }
    } catch (error: any) {
      // Handle errors
      if (error?.status_code === 500) {
        // Server error
        toast.error('Server error. Please try again or contact support.')
      } else {
        // Generic error
        toast.error(error?.detail || 'Failed to process images. Please try again.')
      }
    }
  }, [uploadedFiles, uploadBatch, connectWebSocket, resultFiles, reset])

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    setUploadedFiles([])
    reset() // This resets status to 'idle' and clears resultFiles
    
    // Clear preview data
    setTablePreviewData([])
    setFirstImageUrl('')
    
    // Clear context state
    clearState()
    
    // Reset auto-actions trackers
    autoActionsExecutedRef.current = null
    isExecutingAutoActionsRef.current = false
  }

  // Fetch and parse Excel file for preview (same as landing page)
  const fetchTablePreview = useCallback(async (fileId: string) => {
    try {
      const blob = await ocrApi.downloadFile(fileId)
      
      const arrayBuffer = await blob.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][]
      
      
      // Limit to first 10 rows for preview
      const previewData = data.slice(0, Math.min(10, data.length))
      setTablePreviewData(previewData)
    } catch (error) {
      // Don't show error toast - just silently fail to show preview
    }
  }, [])

  // Fetch table preview when first result file is ready
  useEffect(() => {
    if (resultFiles && resultFiles.length > 0) {
      if (resultFiles[0].file_id && tablePreviewData.length === 0) {
        fetchTablePreview(resultFiles[0].file_id)
      }
    }
  }, [resultFiles, tablePreviewData.length, fetchTablePreview])

  const handleRenameFile = async (file: any) => {
    if (!newFileName.trim()) {
      setEditingFileId(null)
      return
    }

    try {
      // Add .xlsx extension if not present
      const finalName = newFileName.trim().endsWith('.xlsx') ? newFileName.trim() : newFileName.trim() + '.xlsx'
      
      // Update renamed files mapping
      setRenamedFiles(prev => ({
        ...prev,
        [file.file_id]: finalName
      }))
      
      // toast.success('File renamed successfully')
      setEditingFileId(null)
      setNewFileName('')
    } catch (error) {
      toast.error('Failed to rename file')
    }
  }

  const handleShareFile = async (file: any) => {
    
    // Ensure we have a valid file_id
    if (!file || !file.file_id) {
      toast.error('Unable to share: File information is missing')
      return
    }
    
    setSelectedFileToShare(file)
    setShareDialogOpen(true)
    setCopySuccess(false)
  }
  
  const handleCopyLink = async () => {
    if (!selectedFileToShare?.file_id) {
      toast.error('Unable to copy link: File information is missing')
      return
    }
    
    // Clean the base URL to ensure no whitespace
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()
    
    let shareContent = ''
    
    // Check if this is a session-based batch share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareContent = shareSession.share_url
    } 
    // Legacy batch share (fallback)
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      
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
    
    
    try {
      await navigator.clipboard.writeText(shareContent)
      setCopySuccess(true)
      const message = selectedFileToShare.file_id === '__BATCH__' 
        ? `Links for ${selectedFilesForBatch.length} files copied!`
        : 'Download link copied to clipboard'
      // toast.success(message)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link to clipboard')
    }
  }
  
  // Custom share handlers
  // Share handlers for direct messaging (not social media posts)
  const handleMessengerShare = () => {
    if (!selectedFileToShare?.file_id) {
      return
    }
    
    
    // Clean the base URL to remove any newlines or whitespace
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()
    
    // For batch sharing, create a message with all links
    let shareUrl = ''
    
    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareUrl = shareSession.share_url.replace(/\s/g, '')
    } 
    // Legacy batch share
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      // For Messenger, we can only share one link at a time, so create a landing page URL
      // For now, we'll share the first file and indicate there are more
      shareUrl = `${baseUrl}/api/v1/download/${selectedFilesForBatch[0].file_id}`.replace(/\s/g, '')
    } 
    // Single file share
    else {
      shareUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '')
    }
    
    
    // Get app ID from environment or use default
    const appId = (process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '140586622674265').replace(/"/g, '').trim()
    
    // Facebook Messenger Send Dialog for desktop/web
    // Note: This opens the send dialog, not the share dialog
    const currentUrl = window.location.origin
    const messengerUrl = `https://www.facebook.com/dialog/send?app_id=${appId}&link=${encodeURIComponent(shareUrl)}&redirect_uri=${encodeURIComponent(currentUrl)}`
    
    
    // Try to open in popup first
    const popup = window.open(messengerUrl, 'messenger-share-dialog', 'width=600,height=500')
    
    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
      // Fallback: open in new tab
      window.open(messengerUrl, '_blank')
    }
    
    // Show note for batch sharing
    if (selectedFileToShare.file_id === '__BATCH__') {
      // toast.info(`Note: Sharing first of ${selectedFilesForBatch.length} files. Copy all links for complete batch.`, {
      //   duration: 5000
      // })
    }
  }
  
  const handleEmailShare = () => {
    if (!selectedFileToShare?.file_id) {
      return
    }
    
    
    // Clean the base URL to ensure no whitespace
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()
    
    let subject = ''
    let body = ''
    
    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      subject = `${selectedFilesForBatch.length} Excel files processed with AxLiner`
      
      const sessionUrl = shareSession.share_url.replace(/\s/g, '')
      
      body = `Hi,

I've processed ${selectedFilesForBatch.length} files with AxLiner. You can download all files from this link:

${sessionUrl}

Best regards`
    }
    // Legacy batch sharing
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      subject = `${selectedFilesForBatch.length} Excel files processed with AxLiner`
      
      const fileLinks = selectedFilesForBatch.map((file, index) => {
        const fileUrl = `${baseUrl}/api/v1/download/${file.file_id}`.replace(/\s/g, '')
        return `File ${index + 1} (${file.filename || 'result.xlsx'}): ${fileUrl}`
      }).join('\n')
      
      body = `Hi,

I've processed ${selectedFilesForBatch.length} files with AxLiner. You can download them here:

${fileLinks}

Best regards`
    } else {
      // Single file
      const shareUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '')
      subject = `Excel file: ${selectedFileToShare.filename || 'Processed with AxLiner'}`
      body = `Hi,

I've processed this file with AxLiner. You can download it here:

${shareUrl}

Best regards`
    }
    
    
    // Gmail compose URL with parameters
    // This opens Gmail in a new tab with the compose window pre-filled
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    
    // Open Gmail compose in new tab
    const gmailWindow = window.open(gmailUrl, '_blank')
    
    if (!gmailWindow) {
      // Fallback to mailto if popup is blocked
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.location.href = mailtoUrl
    }
  }
  
  const handleLinkedInMessage = () => {
    if (!selectedFileToShare?.file_id) {
      return
    }
    
    
    // Clean the base URL to ensure no whitespace
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()
    
    let shareContent = ''
    
    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareContent = shareSession.share_url.replace(/\s/g, '')
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
    
    
    // LinkedIn doesn't support direct message URLs with pre-filled content
    // Best approach: Copy link and show instructions
    navigator.clipboard.writeText(shareContent)
      .then(() => {
        
        // Show detailed instructions
        const isBatch = selectedFileToShare.file_id === '__BATCH__'
        const message = isBatch 
          ? `${selectedFilesForBatch.length} file links copied to clipboard!`
          : 'Link copied to clipboard!'
        // toast.success(message, {
        //   duration: 8000,
        //   description: 'Opening LinkedIn... Click "New message" → Choose recipient → Paste the links (Ctrl+V or Cmd+V)'
        // })
        
        // Open LinkedIn messaging compose page
        // This URL opens the messaging page with compose view
        window.open('https://www.linkedin.com/messaging/compose/', '_blank')
      })
      .catch((err) => {
        // Fallback: show the link for manual copying
        const fallbackInput = document.createElement('input')
        fallbackInput.value = shareContent
        document.body.appendChild(fallbackInput)
        fallbackInput.select()
        document.execCommand('copy')
        document.body.removeChild(fallbackInput)
        
        // toast.success('Link copied! Opening LinkedIn...', {
        //   duration: 6000
        // })
        window.open('https://www.linkedin.com/messaging/compose/', '_blank')
      })
  }

  const handleXShare = () => {
    if (!selectedFileToShare?.file_id) {
      return
    }
    
    
    // Clean the base URL to ensure no whitespace
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()
    
    let tweetText = ''
    let shareUrl = ''
    
    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareUrl = shareSession.share_url.replace(/\s/g, '')
      tweetText = `Check out these ${selectedFilesForBatch.length} Excel files I processed with AxLiner! 📊✨`
    }
    // Legacy batch sharing
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      // For batch, use the first file URL as example
      shareUrl = `${baseUrl}/api/v1/download/${selectedFilesForBatch[0].file_id}`.replace(/\s/g, '')
      tweetText = `Check out these ${selectedFilesForBatch.length} Excel files I processed with AxLiner! 📊✨`
    }
    // Single file
    else {
      shareUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '')
      tweetText = `Check out this Excel file I processed with AxLiner! 📊✨`
    }
    
    // X (Twitter) Web Intent URL
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`
    
    
    window.open(xUrl, '_blank', 'width=550,height=420')
    
    // toast.success('X share window opened!', {
    //   description: 'Customize your tweet and share with your followers'
    // })
  }

  const handleShareAll = async () => {
    
    if (!jobId || !resultFiles || resultFiles.length === 0) {
      toast.error('Unable to share batch: No files available')
      return
    }
    
    // Get all valid file IDs
    const allFileIds = resultFiles.map(f => f.file_id).filter(Boolean)
    
    if (allFileIds.length === 0) {
      toast.error('Unable to share: No valid files found')
      return
    }
    
    try {
      // Create a share session for all files
      
      const sessionResponse = await ocrApi.createShareSession({
        file_ids: allFileIds,
        title: `Batch of ${resultFiles.length} Excel files`,
        description: `Processed on ${new Date().toLocaleDateString()}`,
        expires_in_days: 7
      })
      
      
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
      
      // toast.success('Share link created successfully!')
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to create share link'
      toast.error(`Error: ${errorMessage}`)
    }
  }

  

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isComplete = status === 'completed' && resultFiles && resultFiles.length > 0
  const uploadedSizeMb = uploadedFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024)
  const uploadedLabel = `${uploadedFiles.length} ${uploadedFiles.length === 1 ? 'image' : 'images'}`
  const processLabel = uploadedFiles.length > 1 ? `Process ${uploadedFiles.length} images` : 'Process image'

  return (
    <div className="ax-page-bg min-h-screen relative lg:flex lg:gap-4 lg:p-4">
      <WorkspaceSidebar activeItem="process" user={user} />
      <div className="relative z-10 flex-1">
      <header className="relative z-10 hidden lg:block">
        <div className="container max-w-7xl mx-auto px-4 pt-4">
          <div className="ax-glass-header rounded-[28px] px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="h-10 rounded-2xl border border-[#eadfff] bg-white/55 px-3 text-[#5b3f92] hover:bg-white hover:text-[#2f165e]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7c62b1]">Batch workspace</p>
                  <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">Process Images</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/history')}
                  className="h-10 rounded-2xl border-[#eadfff] bg-white/60 px-4 text-foreground hover:bg-white"
                >
                  History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="h-10 rounded-2xl border-[#eadfff] bg-white/60 px-4 text-foreground hover:bg-white"
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur lg:hidden">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-10 rounded-2xl border border-[#eadfff] bg-[#faf7ff] px-3 text-[#5b3f92]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <AppIcon size={28} />
              <span className="text-sm font-semibold text-foreground">Process Images</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="h-10 rounded-2xl border-[#eadfff] bg-white px-3"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      <main className="container max-w-7xl mx-auto px-4 py-6 pb-24 lg:py-8 relative z-10">
        {isProcessing && !isComplete && (
          <Card className="ax-glass-card mb-5 overflow-hidden rounded-[28px]">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eadfff] bg-white/55">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Processing batch</p>
                    {progress && (
                      <p className="text-xs text-muted-foreground">
                        {progress.processed_images} of {progress.total_images} ready
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                  <div className="rounded-2xl border border-[#eadfff] bg-white/50 px-4 py-2">
                    <p className="text-xl font-bold text-primary">{processingTime}s</p>
                    <p className="text-[11px] text-muted-foreground">elapsed</p>
                  </div>
                  {progress && (
                    <div className="rounded-2xl border border-[#eadfff] bg-white/50 px-4 py-2">
                      <p className="text-xl font-bold text-primary">{progress.percentage}%</p>
                      <p className="text-[11px] text-muted-foreground">complete</p>
                    </div>
                  )}
                </div>
              </div>
              {progress && (
                <Progress value={progress.percentage} className="mt-4 h-2" />
              )}
            </CardContent>
          </Card>
        )}


        <div className={cn(
          "grid grid-cols-1 gap-4 lg:gap-6",
          isComplete ? "lg:grid-cols-1" : "lg:grid-cols-4"
        )}>
          <div className={cn(
            "order-2 lg:order-1",
            isComplete ? "lg:col-span-1" : "lg:col-span-3"
          )}>
            {!isComplete ? (
              <Card className="ax-glass-card overflow-hidden rounded-[32px]">
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7c62b1]">Upload</p>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Build a batch</h2>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-[#eadfff] bg-white/45 px-3 py-2 text-sm font-semibold text-[#4b2d82]">
                      <span>{uploadedFiles.length}</span>
                      <span className="text-muted-foreground">/ 100</span>
                    </div>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "relative overflow-hidden rounded-[28px] border border-dashed transition-all duration-200",
                      isDragging
                        ? "border-[#7c3aed] bg-[#f5efff]/80 scale-[0.995]"
                        : "border-[#d9c9fb] bg-white/45 hover:border-[#a78bfa]"
                    )}
                  >
                    {uploadedFiles.length === 0 ? (
                      <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[24px] border border-[#eadfff] bg-white/65 shadow-[0_18px_45px_rgba(68,31,132,0.10)]">
                          <FolderUp className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {isDragging ? "Drop images here" : "Drop images to convert"}
                        </h3>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                          Add screenshots, handwritten tables, forms, or receipts in one batch.
                        </p>
                        <label htmlFor="file-upload" className="mt-6">
                          <Button asChild className="h-12 rounded-2xl px-6">
                            <span>
                              <FileImage className="mr-2 h-4 w-4" />
                              Choose images
                            </span>
                          </Button>
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          accept="image/*,image/heic,image/heif"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="p-3 sm:p-4">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="gap-1 rounded-full border border-[#eadfff] bg-white/70 px-3 py-1">
                              <ImageIcon className="h-3 w-3" />
                              {uploadedLabel}
                            </Badge>
                            <span className="text-xs font-medium text-muted-foreground">
                              {uploadedSizeMb.toFixed(1)} MB selected
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setUploadedFiles([])}
                              className="rounded-2xl"
                            >
                              Clear
                            </Button>
                            <label htmlFor="file-upload-more">
                              <Button size="sm" variant="outline" asChild className="rounded-2xl border-[#eadfff] bg-white/65">
                                <span>Add images</span>
                              </Button>
                            </label>
                            <input
                              id="file-upload-more"
                              type="file"
                              multiple
                              accept="image/*,image/heic,image/heif"
                              onChange={handleFileInput}
                              className="hidden"
                            />
                          </div>
                        </div>

                        <div className="grid max-h-[430px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-5">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="group relative aspect-square overflow-hidden rounded-2xl border border-[#eadfff] bg-white/70 shadow-sm"
                            >
                              <img
                                src={filePreviewUrls[index] || ''}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                              <button
                                onClick={() => handleRemoveFile(index)}
                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-2">
                                <p className="truncate text-[10px] font-medium text-white">
                                  {file.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-5 flex flex-col gap-3 rounded-[24px] border border-[#eadfff] bg-white/45 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{uploadedLabel} ready</p>
                      <p className="text-xs text-muted-foreground">Each file becomes downloadable as soon as it finishes.</p>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleProcessImages}
                      disabled={isProcessing}
                      className="h-12 gap-2 rounded-2xl px-6"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          {processLabel}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
                </CardContent>
              </Card>
            ) : null}

            {(isProcessing || isComplete) && resultFiles && resultFiles.length > 0 && (
              <TooltipProvider>
              <Card className="ax-glass-card mt-5 overflow-hidden rounded-[32px]">
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7c62b1]">Results</p>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                        {isComplete ? "Batch ready" : "Ready files"}
                      </h2>
                    </div>
                {isComplete && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleReset}
                      className="h-10 gap-2 rounded-2xl bg-primary text-white hover:bg-primary/90"
                    >
                      <ArrowRight className="h-4 w-4" />
                      New batch
                    </Button>
                    {!isSaved && (
                      <Button
                        size="sm"
                        onClick={saveToHistory}
                        disabled={isSaving}
                        className="h-10 gap-2 rounded-2xl border border-[#eadfff] bg-white/65 text-foreground hover:bg-white"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save to History
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resultFiles.length > 1 ? handleShareAll : () => handleShareFile(resultFiles[0])}
                      className="h-10 gap-2 rounded-2xl border-[#eadfff] bg-white/65 text-foreground hover:bg-white"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        let downloadCount = 0
                        for (const file of resultFiles) {
                          if (!file.file_id) {
                            continue
                          }

                          try {
                            await downloadFile(file.file_id)
                            downloadCount++
                            await new Promise(resolve => setTimeout(resolve, 500))
                          } catch (error) {
                            toast.error(`Failed to download ${file.filename || 'file'}`)
                          }
                        }

                        if (downloadCount > 0 && downloadCount < resultFiles.length) {
                          toast.warning(`Downloaded ${downloadCount} of ${resultFiles.length} files`)
                        } else if (downloadCount === 0) {
                          toast.error('Failed to download any files')
                        }
                      }}
                      className="h-10 gap-2 rounded-2xl border-[#eadfff] bg-white/65 text-foreground hover:bg-white"
                    >
                      <DownloadCloud className="h-4 w-4" />
                      Download all
                    </Button>
                  </div>
                )}
                  </div>

                <div className="space-y-3">
                  {resultFiles.length > 0 && (
                    <div className="space-y-2">
                      {tablePreviewData.length > 0 && firstImageUrl && (
                        <Card className="overflow-hidden rounded-[24px] border-[#eadfff] bg-white/55">
                          <CardContent className="p-3">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              <div className="flex flex-col">
                                <h4 className="text-sm font-semibold mb-0.5 text-muted-foreground">Original Image</h4>
                                <div className="border-2 border-[#A78BFA]/20 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ maxHeight: '450px' }}>
                                  <img 
                                    src={firstImageUrl} 
                                    alt="Original" 
                                    className="max-w-full h-auto object-contain"
                                    style={{ maxHeight: '430px' }}
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col">
                                <h4 className="text-sm font-semibold mb-0.5 text-muted-foreground">Extracted Data Preview</h4>
                                <div className="border-2 border-[#A78BFA]/20 rounded-lg overflow-auto bg-white" style={{ maxHeight: '450px' }}>
                                  <table className="w-full text-base">
                                    <tbody>
                                      {tablePreviewData.map((row, rowIndex) => (
                                        <tr key={rowIndex} className={rowIndex === 0 ? 'bg-primary/10 font-semibold' : 'border-t border-gray-200'}>
                                          {row.map((cell, cellIndex) => (
                                            <td 
                                              key={cellIndex} 
                                              className="px-3 py-2 text-left border-r border-gray-200 last:border-r-0"
                                            >
                                              {cell || ''}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {tablePreviewData.length >= 10 && (
                                    <div className="px-3 py-2 bg-muted/50 text-xs text-muted-foreground text-center border-t">
                                      Showing first 10 rows
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {resultFiles[0] && (
                        <Card
                          className="overflow-hidden rounded-[22px] border-[#eadfff] bg-white/60 animate-in slide-in-from-bottom-2 duration-300"
                        >
                      <CardContent className="p-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                              1
                            </div>
                            <div className="flex items-center justify-center flex-shrink-0">
                              <FileSpreadsheet className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              {editingFileId === resultFiles[0].file_id ? (
                                <input
                                  type="text"
                                  value={newFileName}
                                  onChange={(e) => setNewFileName(e.target.value)}
                                  onBlur={() => handleRenameFile(resultFiles[0])}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRenameFile(resultFiles[0])
                                    } else if (e.key === 'Escape') {
                                      setEditingFileId(null)
                                      setNewFileName('')
                                    }
                                  }}
                                  className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary w-full"
                                  autoFocus
                                />
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p 
                                      className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors"
                                      onDoubleClick={() => {
                                        const currentName = renamedFiles[resultFiles[0].file_id] || resultFiles[0].filename || `Image 1 Result.xlsx`
                                        setEditingFileId(resultFiles[0].file_id)
                                        setNewFileName(currentName.replace('.xlsx', ''))
                                      }}
                                    >
                                      {renamedFiles[resultFiles[0].file_id] || resultFiles[0].filename || `Image 1 Result`}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs break-all">Double-click to rename</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShareFile(resultFiles[0])}
                              className="h-9 gap-1.5 rounded-xl border-[#eadfff] bg-white/70 text-foreground hover:bg-white"
                            >
                              <Share2 className="h-4 w-4" />
                              Share
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const fileUrl = encodeURIComponent(`https://backend-lively-hill-7043.fly.dev/api/v1/download/${resultFiles[0].file_id}`)
                                window.open(`https://view.officeapps.live.com/op/view.aspx?src=${fileUrl}`, '_blank')
                              }}
                              className="h-9 gap-1.5 rounded-xl border-[#eadfff] bg-white/70 text-foreground hover:bg-white"
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (!resultFiles[0].file_id) {
                                  toast.error('Unable to download: File ID is missing')
                                  return
                                }
                                downloadFile(resultFiles[0].file_id)
                              }}
                              className="h-9 gap-2 rounded-xl bg-primary text-white hover:bg-primary/90"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                      )}
                    </div>
                  )}

                  {resultFiles.slice(1).map((file: any, index: number) => (
                    <Card
                      key={file.file_id || index + 1}
                      className="overflow-hidden rounded-[22px] border-[#eadfff] bg-white/60 animate-in slide-in-from-bottom-2 duration-300"
                    >
                      <CardContent className="p-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                              {index + 2}
                            </div>
                            <div className="flex items-center justify-center flex-shrink-0">
                              <FileSpreadsheet className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              {editingFileId === file.file_id ? (
                                <input
                                  type="text"
                                  value={newFileName}
                                  onChange={(e) => setNewFileName(e.target.value)}
                                  onBlur={() => handleRenameFile(file)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRenameFile(file)
                                    } else if (e.key === 'Escape') {
                                      setEditingFileId(null)
                                      setNewFileName('')
                                    }
                                  }}
                                  className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary w-full"
                                  autoFocus
                                />
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p 
                                      className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors"
                                      onDoubleClick={() => {
                                        const currentName = renamedFiles[file.file_id] || file.filename || `Image ${index + 2} Result.xlsx`
                                        setEditingFileId(file.file_id)
                                        setNewFileName(currentName.replace('.xlsx', ''))
                                      }}
                                    >
                                      {renamedFiles[file.file_id] || file.filename || `Image ${index + 2} Result`}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs break-all">Double-click to rename</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShareFile(file)}
                              className="h-9 gap-1.5 rounded-xl border-[#eadfff] bg-white/70 text-foreground hover:bg-white"
                            >
                              <Share2 className="h-4 w-4" />
                              Share
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const fileUrl = encodeURIComponent(`https://backend-lively-hill-7043.fly.dev/api/v1/download/${file.file_id}`)
                                window.open(`https://view.officeapps.live.com/op/view.aspx?src=${fileUrl}`, '_blank')
                              }}
                              className="h-9 gap-1.5 rounded-xl border-[#eadfff] bg-white/70 text-foreground hover:bg-white"
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (!file.file_id) {
                                  toast.error('Unable to download: File ID is missing')
                                  return
                                }
                                downloadFile(file.file_id)
                              }}
                              className="h-9 gap-2 rounded-xl bg-primary text-white hover:bg-primary/90"
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
                </CardContent>
              </Card>
              </TooltipProvider>
            )}
          </div>

          {!isComplete && (
          <div className="order-3 space-y-4 lg:order-2 lg:col-span-1">
            <Card className="ax-glass-card overflow-hidden rounded-[28px]">
              <CardContent className="space-y-4 p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7c62b1]">Preferences</p>
                  <h3 className="mt-1 text-lg font-bold tracking-tight text-foreground">Output flow</h3>
                </div>

                <div>
                <Label className="mb-2 block text-xs font-semibold text-muted-foreground">Language</Label>
                <select
                  className="w-full rounded-2xl border border-[#eadfff] bg-white/60 p-3 text-sm font-medium text-foreground transition-all hover:border-[#A78BFA]/70 focus:border-[#A78BFA] focus:outline-none"
                  value={selectedLanguage}
                  onChange={(e) => {
                    const newLanguage = e.target.value
                    setSelectedLanguage(newLanguage)
                    localStorage.setItem('ocrLanguage', newLanguage)
                    const params = new URLSearchParams(searchParams.toString())
                    params.set('language', newLanguage)
                    router.push(`/dashboard/client?${params.toString()}`)
                  }}
                >
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                  <option value="es">Español</option>
                  <option value="it">Italiano</option>
                  <option value="pt">Português</option>
                  <option value="zh">中文</option>
                </select>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (!autoDownload) {
                        setShowAutoDownloadConfirm(true)
                      } else {
                        setAutoDownload(false)
                      }
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border p-3 transition-all hover:border-[#A78BFA]/70",
                      autoDownload
                        ? "border-[#A78BFA] bg-primary/10"
                        : "border-[#eadfff] bg-white/45"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <DownloadCloud className={cn(
                        "h-4 w-4",
                        autoDownload ? "text-primary" : "text-muted-foreground"
                      )} />
                      <Label htmlFor="auto-download" className="text-xs font-medium text-foreground cursor-pointer">
                        Auto-download
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
                      "flex w-full items-center justify-between rounded-2xl border p-3 transition-all hover:border-[#A78BFA]/70",
                      autoSave
                        ? "border-[#A78BFA] bg-primary/10"
                        : "border-[#eadfff] bg-white/45"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Save className={cn(
                        "h-4 w-4",
                        autoSave ? "text-primary" : "text-muted-foreground"
                      )} />
                      <Label htmlFor="auto-save" className="text-xs font-medium text-foreground cursor-pointer">
                        Auto-save
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
          </div>
          )}
        </div>
      </main>
      </div>
      
      <Dialog open={shareDialogOpen} onOpenChange={(open) => {
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
            <div className="space-y-3">
              <p className="text-xs text-center text-muted-foreground">Share your download link:</p>
              <div className="flex justify-center gap-4">
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

                <button
                  onClick={handleMessengerShare}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title="Send via Facebook Messenger"
                >
                  <MessageCircle className="h-10 w-10 text-[#0084FF] group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Messenger</span>
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            
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
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAutoDownloadConfirm} onOpenChange={setShowAutoDownloadConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <DialogTitle>Enable Auto-Download?</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Files will download to your device as soon as they finish.
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
