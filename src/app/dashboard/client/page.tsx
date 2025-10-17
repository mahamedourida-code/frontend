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
  MessageCircle,
  Mail
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
  FacebookMessengerShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookMessengerIcon,
  WhatsappIcon,
  EmailIcon
} from "react-share"
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
  const [copySuccess, setCopySuccess] = useState(false)

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
    setSelectedFileToShare(file)
    setShareDialogOpen(true)
    setCopySuccess(false)
  }
  
  const handleCopyLink = async () => {
    const shareUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev'}/api/v1/download/${selectedFileToShare?.file_id}`
    await navigator.clipboard.writeText(shareUrl)
    setCopySuccess(true)
    toast.success('Download link copied to clipboard')
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const handleShareAll = async () => {
    setSelectedFileToShare({
      file_id: `batch/${jobId}`,
      filename: `${resultFiles?.length} Excel files`,
      isBatch: true
    })
    setShareDialogOpen(true)
    setCopySuccess(false)
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
                            toast.info(`Downloading ${resultFiles.length} files...`)
                            for (const file of resultFiles) {
                              await downloadFile(file.file_id)
                              await new Promise(resolve => setTimeout(resolve, 500))
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
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                              <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {file.filename || `Image ${index + 1} Result`}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <p className="text-xs text-muted-foreground">
                                  Ready to download
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
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
                              onClick={() => downloadFile(file.file_id)}
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
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Share File</DialogTitle>
            <DialogDescription className="text-sm">
              {selectedFileToShare?.isBatch 
                ? `Share ${selectedFileToShare?.filename}` 
                : selectedFileToShare?.filename || 'Excel file'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Social Media Share Buttons */}
            <div className="flex justify-center gap-4">
              <FacebookMessengerShareButton
                url={`${process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev'}/api/v1/download/${selectedFileToShare?.file_id}`}
                appId="YOUR_FACEBOOK_APP_ID"
              >
                <div className="group flex flex-col items-center gap-1.5 cursor-pointer">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0078FF] to-[#00C6FF] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Messenger</span>
                </div>
              </FacebookMessengerShareButton>
              
              <WhatsappShareButton
                url={`${process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev'}/api/v1/download/${selectedFileToShare?.file_id}`}
                title={`Processed Excel file: ${selectedFileToShare?.filename || 'Exceletto Export'}`}
              >
                <div className="group flex flex-col items-center gap-1.5 cursor-pointer">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">WhatsApp</span>
                </div>
              </WhatsappShareButton>
              
              <EmailShareButton
                url={`${process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev'}/api/v1/download/${selectedFileToShare?.file_id}`}
                subject={`Processed Excel file: ${selectedFileToShare?.filename || 'Exceletto Export'}`}
                body="I've processed this file with Exceletto. Download it here:"
              >
                <div className="group flex flex-col items-center gap-1.5 cursor-pointer">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#EA4335] to-[#D33B2C] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Email</span>
                </div>
              </EmailShareButton>
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
                  value={`${process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev'}/api/v1/download/${selectedFileToShare?.file_id || ''}`}
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
