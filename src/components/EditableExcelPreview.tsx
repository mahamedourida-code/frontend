"use client"

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Undo2,
  Redo2,
  Trash2,
  Plus,
  Save,
  X,
  Grid3x3,
  Edit3,
  GripVertical,
  Calendar,
  Hash,
  Type,
  DollarSign,
  Scissors,
  Sparkles,
  FileImage,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { Input } from '@/components/ui/input'
import apiClient from '@/lib/api-client'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

interface EditableExcelPreviewProps {
  isOpen: boolean
  onClose: () => void
  fileId: string
  fileName: string
  onSave: (data: any[][]) => void
  originalImageUrl?: string
}

interface HistoryEntry {
  data: any[][]
  headers: string[]
  columnOrder: number[]
  action: string
}

// Sortable Column Header Component
function SortableHeader({ 
  id, 
  header, 
  colIndex, 
  onEdit, 
  onDelete,
  onFormat,
  isEditing 
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <th 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "border border-gray-300 dark:border-gray-700 px-4 py-2 min-w-[140px] relative group bg-gray-50 dark:bg-gray-900",
        isDragging && "z-50 shadow-lg"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        {isEditing ? (
          <Input
            defaultValue={header}
            className="h-7 flex-1 border-2 border-blue-500 text-sm px-2"
            onBlur={(e) => onEdit(colIndex, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onEdit(colIndex, e.currentTarget.value)
              }
            }}
            autoFocus
          />
        ) : (
          <>
            <span 
              className="flex-1 cursor-pointer text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              onClick={() => onEdit(colIndex)}
            >
              {header}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Format Column</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onFormat(colIndex, 'text')}>
                  <Type className="h-4 w-4 mr-2" />
                  Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat(colIndex, 'number')}>
                  <Hash className="h-4 w-4 mr-2" />
                  Number
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat(colIndex, 'currency')}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Currency
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat(colIndex, 'date')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Date
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(colIndex)}
                  className="text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </th>
  )
}

export function EditableExcelPreview({
  isOpen,
  onClose,
  fileId,
  fileName,
  onSave,
  originalImageUrl
}: EditableExcelPreviewProps) {
  const [data, setData] = useState<any[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnOrder, setColumnOrder] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editingHeader, setEditingHeader] = useState<number | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showSplitView, setShowSplitView] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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
        const initialOrder = extractedHeaders.map((_, i) => i)

        setHeaders(extractedHeaders)
        setData(extractedData)
        setColumnOrder(initialOrder)
        
        // Add to history
        addToHistory(extractedData, extractedHeaders, initialOrder, 'Initial load')
      }

      // Load original image if URL provided
      if (originalImageUrl) {
        setOriginalImage(originalImageUrl)
      }
    } catch (error) {
      console.error('Error loading Excel data:', error)
      toast.error('Failed to load Excel data')
    } finally {
      setLoading(false)
    }
  }

  // History management
  const addToHistory = (newData: any[][], newHeaders: string[], newColumnOrder: number[], action: string) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ data: newData, headers: newHeaders, columnOrder: newColumnOrder, action })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setData(prevState.data)
      setHeaders(prevState.headers)
      setColumnOrder(prevState.columnOrder)
      setHistoryIndex(historyIndex - 1)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setData(nextState.data)
      setHeaders(nextState.headers)
      setColumnOrder(nextState.columnOrder)
      setHistoryIndex(historyIndex + 1)
    }
  }

  // Handle column drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = columnOrder.indexOf(Number(active.id))
      const newIndex = columnOrder.indexOf(Number(over?.id))

      const newOrder = arrayMove(columnOrder, oldIndex, newIndex)
      setColumnOrder(newOrder)
      addToHistory(data, headers, newOrder, `Reorder columns`)
    }
  }

  // Cell editing
  const handleCellEdit = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data]
    newData[rowIndex][colIndex] = value
    setData(newData)
    addToHistory(newData, headers, columnOrder, `Edit cell [${rowIndex + 1}, ${colIndex + 1}]`)
    setEditingCell(null)
  }

  // Header editing
  const handleHeaderEdit = (colIndex: number, value?: string) => {
    if (value !== undefined) {
      const newHeaders = [...headers]
      newHeaders[colIndex] = value
      setHeaders(newHeaders)
      addToHistory(data, newHeaders, columnOrder, `Edit header "${value}"`)
      setEditingHeader(null)
    } else {
      setEditingHeader(colIndex)
    }
  }

  // Row operations
  const deleteRow = (rowIndex: number) => {
    const newData = data.filter((_, index) => index !== rowIndex)
    setData(newData)
    addToHistory(newData, headers, columnOrder, `Delete row ${rowIndex + 1}`)
  }

  const addRow = () => {
    const newRow = new Array(headers.length).fill('')
    const newData = [...data, newRow]
    setData(newData)
    addToHistory(newData, headers, columnOrder, 'Add new row')
  }

  // Column operations
  const deleteColumn = (colIndex: number) => {
    const newHeaders = headers.filter((_, index) => index !== colIndex)
    const newData = data.map(row => row.filter((_, index) => index !== colIndex))
    const newOrder = columnOrder
      .filter(i => i !== colIndex)
      .map(i => i > colIndex ? i - 1 : i)
    setHeaders(newHeaders)
    setData(newData)
    setColumnOrder(newOrder)
    addToHistory(newData, newHeaders, newOrder, `Delete column "${headers[colIndex]}"`)
  }

  const addColumn = () => {
    const newHeaders = [...headers, `Column ${headers.length + 1}`]
    const newData = data.map(row => [...row, ''])
    const newOrder = [...columnOrder, headers.length]
    setHeaders(newHeaders)
    setData(newData)
    setColumnOrder(newOrder)
    addToHistory(newData, newHeaders, newOrder, 'Add new column')
  }

  // Column formatting
  const formatColumn = (colIndex: number, format: 'text' | 'number' | 'currency' | 'date') => {
    const newData = data.map(row => {
      const cell = row[colIndex]
      let formattedValue = cell
      
      if (format === 'number') {
        const num = String(cell).replace(/[^0-9.-]/g, '')
        formattedValue = isNaN(Number(num)) ? cell : num
      } else if (format === 'currency') {
        const num = String(cell).replace(/[^0-9.-]/g, '')
        if (!isNaN(Number(num)) && num !== '') {
          formattedValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(Number(num))
        }
      } else if (format === 'date') {
        const date = new Date(cell)
        if (!isNaN(date.getTime())) {
          formattedValue = date.toLocaleDateString()
        }
      } else {
        formattedValue = String(cell).trim()
      }
      
      return row.map((c, i) => i === colIndex ? formattedValue : c)
    })
    
    setData(newData)
    addToHistory(newData, headers, columnOrder, `Format column "${headers[colIndex]}" as ${format}`)
    toast.success(`Column formatted as ${format}`)
  }

  // Bulk clean actions
  const trimAllCells = () => {
    const newData = data.map(row => 
      row.map(cell => typeof cell === 'string' ? cell.trim() : cell)
    )
    const newHeaders = headers.map(h => h.trim())
    setData(newData)
    setHeaders(newHeaders)
    addToHistory(newData, newHeaders, columnOrder, 'Trim all cells')
    toast.success('All cells trimmed')
  }

  const removeEmptyRows = () => {
    const newData = data.filter(row => 
      row.some(cell => cell !== '' && cell !== null && cell !== undefined)
    )
    setData(newData)
    addToHistory(newData, headers, columnOrder, 'Remove empty rows')
    toast.success('Empty rows removed')
  }

  const fixCurrency = () => {
    const newData = data.map(row => 
      row.map(cell => {
        if (typeof cell === 'string') {
          const num = cell.replace(/[$,]/g, '')
          if (!isNaN(Number(num)) && num !== '' && (cell.includes('$') || cell.includes(','))) {
            return num
          }
        }
        return cell
      })
    )
    setData(newData)
    addToHistory(newData, headers, columnOrder, 'Fix currency formatting')
    toast.success('Currency formatting fixed')
  }

  // Save and download
  const handleSave = () => {
    // Reorder data according to columnOrder
    const reorderedHeaders = columnOrder.map(i => headers[i])
    const reorderedData = data.map(row => columnOrder.map(i => row[i]))
    
    // Combine headers and data
    const fullData = [reorderedHeaders, ...reorderedData]
    
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
    return null
  }

  if (!isOpen) {
    return null
  }

  // Use portal to render at document body level
  return typeof window !== 'undefined' ? createPortal(
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      {/* Main Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="relative w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] max-w-[1800px] max-h-[900px] bg-background rounded-lg shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
        {/* Excel-like Header Bar */}
        <div className="flex items-center justify-between h-14 px-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <Grid3x3 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">{fileName}</span>
            <Badge variant="secondary" className="ml-2">
              {data.length} rows × {headers.length} columns
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Excel-like Ribbon Toolbar */}
        <div className="border-b bg-muted/20">
          {/* Tab Headers */}
          <div className="flex items-center h-9 px-4 border-b gap-4 text-sm">
            <span className="px-3 py-1 border-b-2 border-primary font-medium">Home</span>
            <span className="px-3 py-1 text-muted-foreground hover:text-foreground cursor-pointer">Insert</span>
            <span className="px-3 py-1 text-muted-foreground hover:text-foreground cursor-pointer">Data</span>
            <span className="px-3 py-1 text-muted-foreground hover:text-foreground cursor-pointer">View</span>
          </div>
          
          {/* Ribbon Content */}
          <div className="flex items-center px-4 py-2 gap-6">
            {/* Clipboard Section */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={undo}
                disabled={historyIndex <= 0}
                className="h-9 px-3"
              >
                <Undo2 className="h-4 w-4 mr-1" />
                <span className="text-xs">Undo</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="h-9 px-3"
              >
                <Redo2 className="h-4 w-4 mr-1" />
                <span className="text-xs">Redo</span>
              </Button>
            </div>

            <div className="h-8 w-px bg-border" />

            {/* Insert Section */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={addRow}
                className="h-9 px-3"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="text-xs">Insert Row</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={addColumn}
                className="h-9 px-3"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="text-xs">Insert Column</span>
              </Button>
            </div>

            <div className="h-8 w-px bg-border" />

            {/* Data Cleanup Section */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={trimAllCells}
                className="h-9 px-3"
              >
                <Scissors className="h-4 w-4 mr-1" />
                <span className="text-xs">Trim Cells</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={removeEmptyRows}
                className="h-9 px-3"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="text-xs">Remove Empty</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={fixCurrency}
                className="h-9 px-3"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                <span className="text-xs">Fix Currency</span>
              </Button>
            </div>

            <div className="h-8 w-px bg-border" />

            {/* View Section */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={showSplitView ? "secondary" : "ghost"}
                onClick={() => setShowSplitView(!showSplitView)}
                className="h-9 px-3"
              >
                <FileImage className="h-4 w-4 mr-1" />
                <span className="text-xs">{showSplitView ? 'Hide' : 'Show'} Original</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Split View - Original Image */}
          {showSplitView && originalImage && (
            <div className="w-1/3 border-r flex flex-col">
              <div className="px-4 py-2 border-b bg-muted/30">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  Original Image
                </h3>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-muted/10">
                <img 
                  src={originalImage} 
                  alt="Original" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}

          {/* Table Area */}
          <div className={cn(
            "flex-1 overflow-auto bg-white dark:bg-gray-950",
            showSplitView && "w-2/3"
          )}>
            <div className="h-full">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 bg-gray-100 dark:bg-gray-900 z-20 shadow-sm">
                    <tr>
                      <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center w-16 bg-gray-50 dark:bg-gray-900 font-medium text-xs text-gray-600 dark:text-gray-400">#</th>
                      <SortableContext
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        {columnOrder.map((originalIndex) => (
                          <SortableHeader
                            key={originalIndex}
                            id={originalIndex}
                            header={headers[originalIndex]}
                            colIndex={originalIndex}
                            onEdit={handleHeaderEdit}
                            onDelete={deleteColumn}
                            onFormat={formatColumn}
                            isEditing={editingHeader === originalIndex}
                          />
                        ))}
                      </SortableContext>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="group hover:bg-blue-50 dark:hover:bg-blue-950/20">
                        <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 font-medium">
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
                        {columnOrder.map((originalIndex) => {
                          const actualColIndex = originalIndex
                          const cell = row[actualColIndex]
                          return (
                            <td 
                              key={originalIndex}
                              className="border border-gray-300 dark:border-gray-700 px-3 py-2 cursor-cell hover:bg-blue-100 dark:hover:bg-blue-950/30 bg-white dark:bg-gray-950"
                              onClick={() => setEditingCell({ row: rowIndex, col: actualColIndex })}
                            >
                              {editingCell?.row === rowIndex && editingCell?.col === actualColIndex ? (
                                <Input
                                  ref={inputRef}
                                  defaultValue={cell || ''}
                                  className="h-7 border-2 border-blue-500 text-sm px-2"
                                  onBlur={(e) => handleCellEdit(rowIndex, actualColIndex, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCellEdit(rowIndex, actualColIndex, e.currentTarget.value)
                                    } else if (e.key === 'Escape') {
                                      setEditingCell(null)
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <span className="block min-h-[1.5rem] text-sm">{cell || ''}</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DndContext>
            </div>
          </div>
        </div>

        {/* Excel-like Footer with Status Bar */}
        <div className="border-t bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between px-4 py-2">
            {/* Status Information */}
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Grid3x3 className="h-3 w-3" />
                {data.length} rows
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium">·</span>
                {headers.length} columns
              </span>
              {historyIndex > 0 && (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <span className="font-medium">·</span>
                  {historyIndex} changes
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="h-9 px-4"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <Download className="h-4 w-4" />
                Save & Download
              </Button>
            </div>
          </div>
        </div>
          </div>
        </div>
      )}
    </>,
    document.body
  ) : null
}
