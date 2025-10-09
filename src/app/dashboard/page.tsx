"use client"

// Force dynamic rendering to prevent router cache issues on refresh
// This ensures the page always fetches fresh data and doesn't get stuck in cached loading states
export const dynamic = 'force-dynamic'

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileImage, Zap, Sparkles, ArrowRight, CheckCircle2, Layers, LogOut, FileSpreadsheet, Download, Loader2, Clock, Save, BookmarkPlus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeToggle } from "@/components/theme-toggle";
import { useOCR } from "@/hooks/useOCR";

function DashboardContent() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // OCR processing state
  const {
    isProcessing,
    jobId,
    status,
    progress,
    files: resultFiles,
    isSaved,
    isSaving,
    uploadBatch,
    getStatus,
    downloadFile,
    saveToHistory,
    connectWebSocket,
    reset
  } = useOCR();

  // Clean state management on mount - with staleTimes=0, no router cache persists
  useEffect(() => {
    console.log('[Dashboard] Component mounted, current processing state:', isProcessing)

    // If we detect stuck processing state on fresh mount, clean it up
    // This handles interrupted sessions from browser refresh during processing
    if (typeof window !== 'undefined') {
      const wasProcessing = sessionStorage.getItem('wasProcessing')

      if (wasProcessing === 'true') {
        console.log('[Dashboard] Detected interrupted processing, cleaning up...')
        // Clear the flag
        sessionStorage.removeItem('wasProcessing')
        sessionStorage.removeItem('uploadedFilesCache')

        // Reset processing state if stuck
        if (isProcessing) {
          console.log('[Dashboard] Resetting stuck processing state...')
          reset()
        }
      }
    }

    // Cleanup function: mark when component unmounts
    return () => {
      console.log('[Dashboard] Component unmounting')
    }
  }, []) // Empty deps - run ONCE on mount only

  // Track active processing sessions to detect interruptions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isProcessing) {
        sessionStorage.setItem('wasProcessing', 'true')
        console.log('[Dashboard] Marked session as processing')
      } else {
        sessionStorage.removeItem('wasProcessing')
        console.log('[Dashboard] Cleared processing flag')
      }
    }
  }, [isProcessing])

  // Note: We removed file caching since it caused state inconsistencies
  // On page refresh, user will see a clean state and can re-upload files
  // This is better UX than showing stale cached data

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      setUploadedFiles(prev => {
        const remainingSlots = 100 - prev.length;
        const filesToAdd = files.slice(0, remainingSlots);
        return [...prev, ...filesToAdd];
      });
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files).filter(file =>
        file.type.startsWith('image/')
      );
      setUploadedFiles(prev => {
        const remainingSlots = 100 - prev.length;
        const filesToAdd = fileArray.slice(0, remainingSlots);
        return [...prev, ...filesToAdd];
      });
    }
  }, []);

  // Handle Convert to XLSX button click
  const handleConvertToXLSX = useCallback(async () => {
    console.log('[Dashboard] Convert button clicked with', uploadedFiles.length, 'files');

    if (uploadedFiles.length === 0) {
      console.warn('[Dashboard] No files to upload');
      return;
    }

    console.log('[Dashboard] Calling uploadBatch...');
    const response = await uploadBatch(uploadedFiles);
    console.log('[Dashboard] uploadBatch response:', response);

    if (response && response.session_id) {
      console.log('[Dashboard] Connecting to WebSocket for session:', response.session_id);
      // Connect to WebSocket for real-time updates - NO POLLING!
      connectWebSocket(response.session_id);
    } else {
      console.error('[Dashboard] No session_id in response or upload failed');
    }
  }, [uploadedFiles, uploadBatch, connectWebSocket]);

  // No polling - WebSocket handles all real-time updates!

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold text-foreground">Litt Up</span>
            </div>

            <div className="flex items-center gap-4">
              {profile && (
                <Badge variant="outline" className="hidden sm:flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  {profile.usage_credits} Credits
                </Badge>
              )}
              <Badge variant="outline" className="hidden md:flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>{profile?.plan_type || 'Free'} Plan</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/history')}
              >
                History
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Navigate to signout page without signing out yet
                  // The signout page will handle the actual sign out
                  router.push('/signout')
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          {user && (
            <p className="text-sm text-muted-foreground mb-2">
              Welcome back, <span className="font-semibold text-foreground">{user.email}</span>
            </p>
          )}
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            <Layers className="w-3 h-3 mr-1" />
            Batch Processing Enabled
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Transform Table Screenshots to XLSX Files
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Convert <span className="font-bold text-primary">handwritten or digital table screenshots</span> to Excel files. Process <span className="font-bold text-primary">100 in one click</span>.
          </p>
        </div>

        {/* Main Upload Area */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-background to-muted/10 shadow-lg hover:shadow-primary/20 transition-all duration-300">
            <CardContent className="p-0">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative min-h-[280px] flex flex-col items-center justify-center p-8 transition-all duration-300 rounded-lg",
                  isDragging && "bg-primary/5 border-primary scale-[0.98]"
                )}
              >
                {/* Upload Icon Animation */}
                <div className={cn(
                  "mb-6 relative transition-transform duration-300",
                  isDragging && "scale-110"
                )}>
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative bg-primary/10 p-6 rounded-full border-2 border-primary/30">
                    <Upload className="w-12 h-12 text-primary" />
                  </div>
                </div>

                {/* Upload Text */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {isDragging ? "Drop your table screenshots here" : "Import Table Screenshots"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Drag and drop your table screenshots or click to browse
                  </p>

                  {/* File Count Indicator */}
                  <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                    <Layers className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      Process 100 in one click
                    </span>
                  </div>
                </div>

                {/* Browse Button */}
                <label htmlFor="file-upload">
                  <Button
                    size="default"
                    className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                    asChild
                  >
                    <span>
                      <FileImage className="w-4 h-4 mr-2" />
                      Browse Table Screenshots
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

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="animate-bounce">
                    <Zap className="w-3 h-3 mr-1" />
                    Fast Processing
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Uploaded Files Section */}
        {uploadedFiles.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <Card className="mb-4 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Table Screenshots Ready</h2>
                    <p className="text-xs text-muted-foreground">
                      {uploadedFiles.length} of 100 screenshots ready for XLSX conversion
                    </p>
                  </div>
                  <Button
                    size="default"
                    className="bg-primary hover:bg-primary/90 shadow-md"
                    onClick={handleConvertToXLSX}
                    disabled={isProcessing || uploadedFiles.length === 0}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Convert to XLSX ({uploadedFiles.length})
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Batch capacity</span>
                    <span className="font-medium text-foreground">
                      {uploadedFiles.length}/100
                    </span>
                  </div>
                  <Progress value={(uploadedFiles.length / 100) * 100} className="h-1.5" />
                  {uploadedFiles.length >= 100 ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Maximum batch size reached. Convert current batch before uploading more.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {100 - uploadedFiles.length} more screenshots can be added
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {uploadedFiles.map((file, index) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-md transition-all duration-300 border border-border/50 hover:border-primary/50"
                >
                  <CardHeader className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xs font-medium truncate">
                          {file.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {(file.size / 1024).toFixed(1)} KB
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800 text-xs">
                        <CheckCircle2 className="w-2 h-2 mr-1" />
                        Ready
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Processing State - Real-time with WebSocket */}
        {isProcessing && status && status !== 'completed' && (
          <div className="max-w-2xl mx-auto mt-6 animate-in fade-in duration-500">
            <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-transparent shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <Loader2 className="w-6 h-6 text-primary animate-spin relative z-10" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      Processing Your Images
                      <Badge variant="secondary" className="animate-pulse">
                        Live
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className="capitalize font-medium text-primary">{status}</span>
                    </p>
                  </div>
                </div>

                {progress && progress.total_images > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Progress</span>
                      <span className="font-bold text-foreground tabular-nums">
                        {progress.processed_images} / {progress.total_images} images
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={progress.percentage}
                        className="h-3 transition-all duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse pointer-events-none" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {progress.percentage >= 100 ? 'Finalizing...' : 'Processing...'}
                      </span>
                      <span className="font-bold text-primary tabular-nums">
                        {progress.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}

                {(!progress || progress.total_images === 0) && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground animate-pulse">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Initializing batch processing...</span>
                  </div>
                )}

                {/* Real-time processing indicator */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Real-time updates via WebSocket</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Download Results - Animated Entry */}
        {resultFiles && resultFiles.length > 0 && (
          <div className="max-w-2xl mx-auto mt-6 animate-in slide-in-from-bottom duration-700">
            <Card className="border-green-500/50 bg-gradient-to-r from-green-500/10 to-transparent shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 animate-in zoom-in duration-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      Processing Complete!
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                        Ready
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {resultFiles.length} Excel {resultFiles.length === 1 ? 'file' : 'files'} ready for download
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {resultFiles.map((file: any, index: number) => (
                    <Card
                      key={file.file_id || index}
                      className="overflow-hidden hover:shadow-md transition-all duration-300 border border-border/50 hover:border-green-500/50"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {file.filename || file.original_filename || `result-${index + 1}.xlsx`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Excel Spreadsheet
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => downloadFile(file.file_id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Save to History Button */}
                <div className="mt-6 pt-4 border-t border-border/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground">Save to History</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Keep these results in your account for future access
                      </p>
                    </div>
                    <Button
                      variant={isSaved ? "outline" : "default"}
                      size="sm"
                      onClick={saveToHistory}
                      disabled={isSaving || isSaved}
                      className={cn(
                        "ml-4",
                        isSaved && "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/50"
                      )}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : isSaved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Saved
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-4 h-4 mr-2" />
                          Save to History
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Quick Access */}
        {uploadedFiles.length === 0 && !resultFiles && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Batch Processing in 3 Simple Steps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-background to-muted/10 border-border/50 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Layers className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Upload Up to 100</CardTitle>
                  <CardDescription>
                    Drag and drop up to 100 screenshots at once. No need to wait between uploads.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-background to-muted/10 border-border/50 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Process All at Once</CardTitle>
                  <CardDescription>
                    Hit "Process All" and watch as all your files are converted simultaneously in minutes
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-background to-muted/10 border-border/50 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <FileImage className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Export All Together</CardTitle>
                  <CardDescription>
                    Download all processed files as individual sheets or merged into one Excel workbook
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Batch Processing Benefits */}
            <Card className="mt-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Why Batch Processing Matters
                  </h3>
                  <p className="text-muted-foreground">
                    Save hours of repetitive work with our true batch processing capability
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-background/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">60x</div>
                    <div className="text-sm text-muted-foreground">Faster Processing</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">100</div>
                    <div className="text-sm text-muted-foreground">Files Per Batch</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">1</div>
                    <div className="text-sm text-muted-foreground">Click to Process</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
