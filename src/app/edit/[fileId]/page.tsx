"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft } from 'lucide-react'
import * as XLSX from 'xlsx'
import apiClient from '@/lib/api-client'
import { toast } from 'sonner'

export default function PublicEditExcelPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  
  const fileId = params.fileId as string
  const fileName = searchParams.get('fileName') || 'Excel File'
  
  const [data, setData] = useState<any[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadExcelFile = async () => {
      if (!fileId) {
        setError('No file ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch the file from the API
        const response = await apiClient.get(`/api/v1/download/${fileId}`, {
          responseType: 'arraybuffer'
        })

        // Parse the Excel file
        const workbook = XLSX.read(response.data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

        if (jsonData.length > 0) {
          setHeaders(jsonData[0] || [])
          setData(jsonData.slice(1))
        } else {
          setError('The Excel file appears to be empty')
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading Excel file:', error)
        setError('Failed to load the Excel file. Please make sure the link is valid.')
        setLoading(false)
      }
    }

    loadExcelFile()
  }, [fileId])

  const handleCellEdit = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data]
    if (!newData[rowIndex]) {
      newData[rowIndex] = []
    }
    newData[rowIndex][colIndex] = value
    setData(newData)
  }

  const handleDownload = () => {
    try {
      // Create new workbook
      const wb = XLSX.utils.book_new()
      
      // Combine headers and data
      const wsData = [headers, ...data]
      
      // Create worksheet from array of arrays
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      
      // Generate filename
      const downloadFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`
      
      // Write and download the file
      XLSX.writeFile(wb, downloadFileName)
      
      toast.success('File downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-red-600">Error Loading File</h1>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-40 bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-lg font-semibold">{fileName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDownload}
                size="sm"
                className="gap-2 bg-primary hover:bg-primary/90 text-white"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Excel Editor */}
      <main className="container max-w-7xl mx-auto p-4">
        <div className="overflow-auto border rounded-lg bg-white dark:bg-gray-950">
          <table className="w-full">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="border border-gray-300 dark:border-gray-700 px-4 py-2 min-w-[140px] bg-gray-50 dark:bg-gray-900"
                  >
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => {
                        const newHeaders = [...headers]
                        newHeaders[index] = e.target.value
                        setHeaders(newHeaders)
                      }}
                      className="w-full bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className="border border-gray-300 dark:border-gray-700 px-2 py-1"
                    >
                      <input
                        type="text"
                        value={row[colIndex] || ''}
                        onChange={(e) => handleCellEdit(rowIndex, colIndex, e.target.value)}
                        className="w-full bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Info */}
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Click on any cell to edit. Changes are saved locally - download the file to save your edits.
        </div>
      </main>
    </div>
  )
}
