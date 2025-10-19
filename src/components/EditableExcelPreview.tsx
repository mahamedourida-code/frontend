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
        "border p-2 min-w-[120px] relative group bg-background",
        isDragging && "z-50"
      )}
    >
      <div className="flex items-center justify-between gap-1">
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
            className="h-7 flex-1"
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
              className="flex-1 cursor-pointer text-left"
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
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3x3 className="h-5 w-5" />
              Edit Excel: {fileName}
            </div>
            <div className="flex items-center gap-2">
              {showSplitView && (
                <Badge variant="outline">Split View</Badge>
              )}
              <Badge variant="outline">{data.length} rows × {headers.length} columns</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={trimAllCells}>
                  <Scissors className="h-4 w-4 mr-2" />
                  Trim All Cells
                </DropdownMenuItem>
                <DropdownMenuItem onClick={removeEmptyRows}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Empty Rows
                </DropdownMenuItem>
                <DropdownMenuItem onClick={fixCurrency}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Fix Currency Format
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="h-6 w-px bg-border mx-2" />
            <Button
              size="sm"
              variant={showSplitView ? "default" : "outline"}
              onClick={() => setShowSplitView(!showSplitView)}
            >
              <FileImage className="h-4 w-4 mr-1" />
              {showSplitView ? "Hide" : "Show"} Original
            </Button>
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
            "flex-1 overflow-auto p-4",
            showSplitView && "w-2/3"
          )}>
            <div className="border rounded-lg overflow-hidden">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-background z-20">
                    <tr>
                      <th className="border p-2 text-center w-12 bg-muted/50">#</th>
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
                      <tr key={rowIndex} className="group hover:bg-muted/30">
                        <td className="border p-2 text-center text-sm text-muted-foreground bg-muted/30">
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
                              className="border p-2 cursor-pointer hover:bg-muted/50"
                              onClick={() => setEditingCell({ row: rowIndex, col: actualColIndex })}
                            >
                              {editingCell?.row === rowIndex && editingCell?.col === actualColIndex ? (
                                <Input
                                  ref={inputRef}
                                  defaultValue={cell || ''}
                                  className="h-7"
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
                                <span className="block min-h-[1.5rem]">{cell || ''}</span>
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

        <DialogFooter className="px-6 py-4 border-t">
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
