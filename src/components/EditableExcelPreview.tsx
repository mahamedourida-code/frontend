"use client"

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Undo2,
  Redo2,
  Trash2,
  Plus,
  Sparkles,
  Save,
  X,
  Grid3x3,
  Edit3
} from 'lucide-react'
import * as XLSX from 'xlsx'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  Row,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import apiClient from '@/lib/api-client'
import { toast } from 'sonner'

interface EditableExcelPreviewProps {
  isOpen: boolean
  onClose: () => void
  fileId: string
  fileName: string
  onSave: (data: any[][]) => void
}

interface HistoryEntry {
  data: any[][]
  headers: string[]
  action: string
}

export function EditableExcelPreview({
  isOpen,
  onClose,
  fileId,
  fileName,
  onSave
}: EditableExcelPreviewProps) {
  const [data, setData] = useState<any[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editingHeader, setEditingHeader] = useState<number | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load Excel data when dialog opens
  useEffect(() => {
    if (isOpen && fileId) {
      loadExcelData()
    }
  }, [isOpen, fileId])

  const loadExcelData = async () => {
    setLoading(true)
    try {
      // Download the Excel file
      const response = await apiClient.get(`/api/v1/download/${fileId}`, {
        responseType: 'arraybuffer'
      })

      // Parse Excel data
      const workbook = XLSX.read(response.data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][]

      if (jsonData.length > 0) {
        // First row as headers
        const extractedHeaders = jsonData[0].map((h, i) => h?.toString() || `Column ${i + 1}`)
        const extractedData = jsonData.slice(1)

        setHeaders(extractedHeaders)
        setData(extractedData)
        
        // Add to history
        addToHistory(extractedData, extractedHeaders, 'Initial load')
      }
    } catch (error) {
      console.error('Error loading Excel data:', error)
      toast.error('Failed to load Excel data')
    } finally {
      setLoading(false)
    }
  }

  // History management
  const addToHistory = (newData: any[][], newHeaders: string[], action: string) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ data: newData, headers: newHeaders, action })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setData(prevState.data)
      setHeaders(prevState.headers)
      setHistoryIndex(historyIndex - 1)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setData(nextState.data)
      setHeaders(nextState.headers)
      setHistoryIndex(historyIndex + 1)
    }
  }

  // Cell editing
  const handleCellEdit = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data]
    newData[rowIndex][colIndex] = value
    setData(newData)
    addToHistory(newData, headers, `Edit cell [${rowIndex + 1}, ${colIndex + 1}]`)
    setEditingCell(null)
  }

  // Header editing
  const handleHeaderEdit = (colIndex: number, value: string) => {
    const newHeaders = [...headers]
    newHeaders[colIndex] = value
    setHeaders(newHeaders)
    addToHistory(data, newHeaders, `Edit header "${value}"`)
    setEditingHeader(null)
  }

  // Row operations
  const deleteRow = (rowIndex: number) => {
    const newData = data.filter((_, index) => index !== rowIndex)
    setData(newData)
    addToHistory(newData, headers, `Delete row ${rowIndex + 1}`)
  }

  const addRow = () => {
    const newRow = new Array(headers.length).fill('')
    const newData = [...data, newRow]
    setData(newData)
    addToHistory(newData, headers, 'Add new row')
  }

  // Column operations
  const deleteColumn = (colIndex: number) => {
    const newHeaders = headers.filter((_, index) => index !== colIndex)
    const newData = data.map(row => row.filter((_, index) => index !== colIndex))
    setHeaders(newHeaders)
    setData(newData)
    addToHistory(newData, newHeaders, `Delete column "${headers[colIndex]}"`)
  }

  const addColumn = () => {
    const newHeaders = [...headers, `Column ${headers.length + 1}`]
    const newData = data.map(row => [...row, ''])
    setHeaders(newHeaders)
    setData(newData)
    addToHistory(newData, newHeaders, 'Add new column')
  }

  // Auto-format functions
  const autoCleanup = () => {
    let newData = [...data]
    let newHeaders = [...headers]
    
    // Trim whitespace from all cells
    newData = newData.map(row => 
      row.map(cell => {
        if (typeof cell === 'string') {
          return cell.trim()
        }
        return cell
      })
    )
    
    // Remove empty rows
    newData = newData.filter(row => 
      row.some(cell => cell !== '' && cell !== null && cell !== undefined)
    )
    
    // Trim headers
    newHeaders = newHeaders.map(h => h.trim())
    
    // Format numbers (remove commas for proper number parsing)
    newData = newData.map(row => 
      row.map(cell => {
        if (typeof cell === 'string') {
          // Check if it's a number with commas
          const cleanedNumber = cell.replace(/,/g, '')
          if (!isNaN(Number(cleanedNumber)) && cleanedNumber !== '') {
            return cleanedNumber
          }
        }
        return cell
      })
    )
    
    setData(newData)
    setHeaders(newHeaders)
    addToHistory(newData, newHeaders, 'Auto cleanup')
    toast.success('Data cleaned up successfully')
  }

  // Save and download
  const handleSave = () => {
    // Combine headers and data
    const fullData = [headers, ...data]
    
    // Create new workbook
    const ws = XLSX.utils.aoa_to_sheet(fullData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
    
    // Generate buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    
    // Create blob and download
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName.replace(/\.[^/.]+$/, '') + '_edited.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('File downloaded with edits')
    onSave(fullData)
    onClose()
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh]">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading Excel data...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3x3 className="h-5 w-5" />
              Edit Excel: {fileName}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{data.length} rows × {headers.length} columns</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo2 className="h-4 w-4" />
              Undo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo2 className="h-4 w-4" />
              Redo
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            <Button
              size="sm"
              variant="outline"
              onClick={addRow}
            >
              <Plus className="h-4 w-4 mr-1" />
              Row
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={addColumn}
            >
              <Plus className="h-4 w-4 mr-1" />
              Column
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            <Button
              size="sm"
              variant="outline"
              onClick={autoCleanup}
              className="gap-1"
            >
              <Sparkles className="h-4 w-4" />
              Auto Cleanup
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto border rounded-lg">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-muted/50 backdrop-blur z-10">
              <tr>
                <th className="border p-2 text-center w-12">#</th>
                {headers.map((header, colIndex) => (
                  <th 
                    key={colIndex} 
                    className="border p-2 min-w-[120px] relative group"
                  >
                    {editingHeader === colIndex ? (
                      <Input
                        ref={inputRef}
                        defaultValue={header}
                        className="h-7"
                        onBlur={(e) => handleHeaderEdit(colIndex, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleHeaderEdit(colIndex, e.currentTarget.value)
                          } else if (e.key === 'Escape') {
                            setEditingHeader(null)
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <span 
                          className="flex-1 cursor-pointer"
                          onClick={() => setEditingHeader(colIndex)}
                        >
                          {header}
                        </span>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                          onClick={() => deleteColumn(colIndex)}
                        >
                          <X className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="group hover:bg-muted/30">
                  <td className="border p-2 text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <span>{rowIndex + 1}</span>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 rounded"
                        onClick={() => deleteRow(rowIndex)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  </td>
                  {row.map((cell, colIndex) => (
                    <td 
                      key={colIndex} 
                      className="border p-2 cursor-pointer hover:bg-muted/50"
                      onClick={() => setEditingCell({ row: rowIndex, col: colIndex })}
                    >
                      {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                        <Input
                          ref={inputRef}
                          defaultValue={cell || ''}
                          className="h-7"
                          onBlur={(e) => handleCellEdit(rowIndex, colIndex, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCellEdit(rowIndex, colIndex, e.currentTarget.value)
                            } else if (e.key === 'Escape') {
                              setEditingCell(null)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className="block min-h-[1.5rem]">{cell || ''}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Download className="h-4 w-4" />
            Save & Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
