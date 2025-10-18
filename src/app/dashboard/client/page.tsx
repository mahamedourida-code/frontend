"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useOCR } from "@/hooks/useOCR"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { AppIcon } from "@/components/AppIcon"
import { ocrApi } from "@/lib/api-client"
import {
  Upload,
  FileSpreadsheet,
  Image,
  Sparkles,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
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
  MessageCircle
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

export default function ProcessImagesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedView, setSelectedView] = useState<"grid" | "list">("grid")
  const [credits, setCredits] = useState({ used: 0, total: 80 })
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedFileToShare, setSelectedFileToShare] = useState<any>(null)
  const [selectedFilesForBatch, setSelectedFilesForBatch] = useState<any[]>([])
  const [shareSession, setShareSession] = useState<any>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  
  // Log environment configuration on mount
  useEffect(() => {
    console.log('[ProcessImagesPage] Environment Configuration:', {
      API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev',
      WS_URL: process.env.NEXT_PUBLIC_WS_URL,
      FB_APP_ID: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    })
  }, [])

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in')
    }
  }, [user, authLoading, router])

  // Fetch user's credit status
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return
      
      try {
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()
        
        const { data: jobs } = await supabase
          .from('jobs')
          .select('processing_metadata')
          .eq('user_id', user.id)
          .gte('created_at', new Date(new Date().setDate(1)).toISOString())
        
        const creditsUsed = jobs?.reduce((sum: number, job: any) => 
          sum + (job.processing_metadata?.total_images || 1), 0) || 0
        
        setCredits({ used: Math.min(creditsUsed, 80), total: 80 })
      } catch (error) {
        console.error('Error fetching credits:', error)
      }
    }
    
    fetchCredits()
  }, [user])

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
    const creditsAvailable = credits.total - credits.used
    
    if (creditsAvailable <= 0) {
      toast.error('You have run out of credits. Please upgrade your plan to continue.')
      return
    }
    
    if (creditsNeeded > creditsAvailable) {
      toast.error(`You only have ${creditsAvailable} credits remaining. Remove ${creditsNeeded - creditsAvailable} images or upgrade your plan.`)
      return
    }

    const response = await uploadBatch(uploadedFiles)
    if (response && response.session_id) {
      connectWebSocket(response.session_id)
      // Update credits after successful upload
      setCredits(prev => ({ ...prev, used: prev.used + creditsNeeded }))
    }
  }, [uploadedFiles, uploadBatch, connectWebSocket, credits])

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    setUploadedFiles([])
    reset()
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
      <header className="border-b">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppIcon size={36} />
              <div>
                <h1 className="text-lg font-semibold">Process Images</h1>
                <p className="text-xs text-muted-foreground">Convert table images to Excel</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        {/* Status Bar */}
        {isProcessing && !isComplete && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <span className="font-medium">Processing your images...</span>
                {progress && (
                  <span className="ml-3 text-sm text-muted-foreground">
                    {progress.processed_images} of {progress.total_images} completed
                  </span>
                )}
              </div>
              {progress && (
                <span className="text-sm font-medium">{progress.percentage}%</span>
              )}
            </AlertDescription>
            {progress && (
              <Progress value={progress.percentage} className="mt-2" />
            )}
          </Alert>
        )}

        {isComplete && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/5">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="font-medium text-green-600">
                Processing complete! Your files are ready.
              </span>
              <div className="flex gap-2">
                {!isSaved && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={saveToHistory}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>Save to History</>
                    )}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleReset}>
                  New Batch
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
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
                    uploadedFiles.length > 0 ? "p-4" : "p-12"
                  )}
                >
                  {uploadedFiles.length === 0 ? (
                    <div className="text-center">
                      <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-base font-medium mb-1">
                        {isDragging ? "Drop your images here" : "Upload table images"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
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
                        variant={credits.total - credits.used <= 10 ? "destructive" : "secondary"}
                        className="gap-1"
                      >
                        {credits.total - credits.used} / {credits.total} remaining
                      </Badge>
                      {uploadedFiles.length > credits.total - credits.used && (
                        <span className="text-xs text-destructive">
                          Not enough credits!
                        </span>
                      )}
                    </div>
                    <Button
                      size="lg"
                      onClick={handleProcessImages}
                      disabled={isProcessing || (credits.total - credits.used < uploadedFiles.length)}
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

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Stats */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-3">Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={
                      isComplete ? "default" : 
                      isProcessing ? "secondary" : 
                      "outline"
                    }>
                      {isComplete ? "Complete" : 
                       isProcessing ? "Processing" : 
                       "Ready"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Images</span>
                    <span className="font-medium">{uploadedFiles.length}</span>
                  </div>
                  {isProcessing && progress && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress.percentage}%</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-3">Features</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm">Batch Processing</p>
                      <p className="text-xs text-muted-foreground">
                        Process up to 100 images at once
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm">Excel Export</p>
                      <p className="text-xs text-muted-foreground">
                        Download results as XLSX files
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm">Fast Processing</p>
                      <p className="text-xs text-muted-foreground">
                        Powered by advanced OCR AI
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-1">Supported formats:</p>
                    <p className="text-xs">PNG, JPG, JPEG, WebP</p>
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
              <p className="text-xs text-center text-muted-foreground">Send download link to friends:</p>
              <div className="flex justify-center gap-4">
                {/* Facebook Messenger */}
                <button
                  onClick={handleMessengerShare}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title="Send via Facebook Messenger"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0084FF] to-[#0063CE] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Messenger</span>
                </button>
                
                {/* LinkedIn Message */}
                <button
                  onClick={handleLinkedInMessage}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title="Copy link and compose LinkedIn message"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0077B5] to-[#005885] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                  </div>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">LinkedIn</span>
                </button>
                
                {/* Gmail */}
                <button
                  onClick={handleEmailShare}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title="Compose email in Gmail"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EA4335] to-[#D33B2C] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                    </svg>
                  </div>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Gmail</span>
                </button>
              </div>
              {selectedFileToShare && (
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-muted-foreground/70">
                    {selectedFileToShare.filename || 'Excel file'} ready to share
                  </p>
                  <p className="text-[9px] text-muted-foreground/50">
                    LinkedIn: Link will be copied to paste • Gmail: Opens compose window
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
    </div>
  )
}
