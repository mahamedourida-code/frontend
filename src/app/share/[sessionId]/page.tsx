'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Download, 
  FileSpreadsheet, 
  Clock, 
  Eye,
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { AppIcon } from '@/components/AppIcon'
import { ocrApi } from '@/lib/api-client'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface SessionFile {
  file_id: string
  filename: string
  size_bytes?: number
  created_at?: string
}

interface SessionDetails {
  session_id: string
  title?: string
  description?: string
  files: SessionFile[]
  created_at: string
  expires_at?: string
  access_count: number
  is_active?: boolean
}

export default function SharePage() {
  const params = useParams()
  const sessionId = params?.sessionId as string
  
  const [session, setSession] = useState<SessionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)
  
  useEffect(() => {
    if (sessionId) {
      loadSessionDetails()
    }
  }, [sessionId])
  
  const loadSessionDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const details = await ocrApi.getSessionDetails(sessionId)
      
      // Check if session is expired
      if (details.expires_at && new Date(details.expires_at) < new Date()) {
        setError('This share link has expired.')
        setSession(null)
        return
      }
      
      // Check if session is active
      if (details.is_active === false) {
        setError('This share link is no longer available.')
        setSession(null)
        return
      }
      
      setSession(details)
      
    } catch (err: any) {
      console.error('Failed to load session:', err)
      if (err.response?.status === 404) {
        setError('Share link not found. It may have been deleted or expired.')
      } else {
        setError('Failed to load share details. Please try again.')
      }
      setSession(null)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDownloadFile = async (fileId: string, filename: string) => {
    try {
      setDownloading(fileId)
      
      // Clean the base URL
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()
      const downloadUrl = `${baseUrl}/api/v1/download/${fileId}`
      
      // Open in new tab for download
      window.open(downloadUrl, '_blank')
      
      toast.success(`Downloading ${filename}`)
      
    } catch (err) {
      console.error('Download failed:', err)
      toast.error('Failed to download file. Please try again.')
    } finally {
      setDownloading(null)
    }
  }
  
  const handleDownloadAll = async () => {
    if (!session) return
    
    try {
      setDownloadingAll(true)
      
      // Clean the base URL
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()
      const downloadUrl = `${baseUrl}/api/v1/sessions/${sessionId}/download-all`
      
      // Open in new tab for download
      window.open(downloadUrl, '_blank')
      
      toast.success('Downloading all files as ZIP')
      
    } catch (err) {
      console.error('Batch download failed:', err)
      toast.error('Failed to download files. Please try again.')
    } finally {
      setDownloadingAll(false)
    }
  }
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="flex items-center justify-center mb-8">
            <AppIcon size={48} />
          </div>
          
          <Card className="border-muted">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="flex items-center justify-center mb-8">
            <AppIcon size={48} />
          </div>
          
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  If you believe this is an error, please contact the sender for a new link.
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Go to Homepage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  if (!session) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <AppIcon size={48} />
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  {session.title || 'Shared Files'}
                </CardTitle>
                {session.description && (
                  <CardDescription className="text-base">
                    {session.description}
                  </CardDescription>
                )}
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {session.files.length} {session.files.length === 1 ? 'file' : 'files'}
              </Badge>
            </div>
            
            {/* Metadata */}
            <div className="flex flex-wrap gap-4 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Shared {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                </span>
              </div>
              
              {session.expires_at && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>
                    Expires {formatDistanceToNow(new Date(session.expires_at), { addSuffix: true })}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>
                  Viewed {session.access_count} {session.access_count === 1 ? 'time' : 'times'}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            {/* Download All Button */}
            {session.files.length > 1 && (
              <div className="mb-6">
                <Button 
                  onClick={handleDownloadAll}
                  disabled={downloadingAll}
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloadingAll ? 'Preparing ZIP...' : 'Download All as ZIP'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Download all {session.files.length} files in a single ZIP archive
                </p>
              </div>
            )}
            
            {/* Files List */}
            <div className="space-y-3">
              {session.files.map((file, index) => (
                <div
                  key={file.file_id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {file.filename || `File ${index + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size_bytes)}
                        {file.created_at && (
                          <span className="ml-2">
                            • Created {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadFile(file.file_id, file.filename || `file_${index + 1}.xlsx`)}
                    disabled={downloading === file.file_id}
                  >
                    <Download className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">
                      {downloading === file.file_id ? 'Downloading...' : 'Download'}
                    </span>
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Success Message */}
            <Alert className="mt-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Files are ready for download. Click on individual files or use "Download All" for a ZIP archive.
              </AlertDescription>
            </Alert>
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Powered by{' '}
                <a 
                  href="https://exceletto.com" 
                  className="font-medium text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Exceletto
                </a>
                {' '}- AI-powered Excel extraction
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
