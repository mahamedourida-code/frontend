"use client"

import { useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
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
  MoreVertical,
  ArrowLeft,
  Copy,
  ClipboardPaste
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
import { MobileNav } from '@/components/MobileNav'
import { useAuth } from '@/hooks/useAuth'

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
  isEditing,
  onClick
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
        "border border-gray-300 dark:border-gray-700 px-4 py-2 min-w-[140px] relative group bg-gray-50 dark:bg-gray-900 cursor-pointer select-none",
        isDragging && "z-50 shadow-lg"
      )}
      onClick={onClick}
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

// Types for selection
type CellSelection = {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
}

type SelectionType = 'cell' | 'row' | 'column' | 'range'

export default function EditExcelPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  const fileId = params.fileId as string
  const fileName = searchParams.get('fileName') || 'Excel File'
  
  const [data, setData] = useState<any[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnOrder, setColumnOrder] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editingHeader, setEditingHeader] = useState<number | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showSplitView, setShowSplitView] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Selection states
  const [selection, setSelection] = useState<CellSelection | null>(null)
  const [selectionType, setSelectionType] = useState<SelectionType>('cell')
  const [isSelecting, setIsSelecting] = useState(false)
  const [copiedData, setCopiedData] = useState<any[][] | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  
  // Virtual grid dimensions (for zoom out effect)
  const VIRTUAL_ROWS = 1000
  const VIRTUAL_COLS = 100

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load Excel data when page loads
  useEffect(() => {
    if (fileId) {
      loadExcelData()
    }
  }, [fileId])

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
    } catch (error) {
      console.error('Error loading Excel data:', error)
      toast.error('Failed to load Excel data')
      router.back()
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

  // Selection handlers
  const handleCellMouseDown = (row: number, col: number, event: React.MouseEvent) => {
    if (event.button === 2) return // Right click
    
    event.preventDefault() // Prevent text selection
    setIsSelecting(true)
    setSelection({
      startRow: row,
      startCol: col,
      endRow: row,
      endCol: col
    })
    setSelectionType('cell')
    setContextMenu(null)
    setEditingCell(null) // Clear any editing state
  }

  const handleCellMouseEnter = (row: number, col: number) => {
    if (isSelecting && selection) {
      setSelection(prev => ({
        ...prev!,
        endRow: row,
        endCol: col
      }))
      setSelectionType('range')
    }
  }

  const handleCellMouseUp = () => {
    setIsSelecting(false)
  }
  
  // Add global mouse up handler to stop selection when mouse is released outside table
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsSelecting(false)
    }
    
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  const handleColumnHeaderClick = (col: number, event: React.MouseEvent) => {
    event.preventDefault()
    setSelection({
      startRow: 0,
      startCol: col,
      endRow: Math.max(data.length - 1, 0),
      endCol: col
    })
    setSelectionType('column')
    setContextMenu(null)
  }

  const handleRowHeaderClick = (row: number, event: React.MouseEvent) => {
    event.preventDefault()
    setSelection({
      startRow: row,
      startCol: 0,
      endRow: row,
      endCol: headers.length - 1
    })
    setSelectionType('row')
    setContextMenu(null)
  }

  const isSelected = (row: number, col: number) => {
    if (!selection) return false
    
    const minRow = Math.min(selection.startRow, selection.endRow)
    const maxRow = Math.max(selection.startRow, selection.endRow)
    const minCol = Math.min(selection.startCol, selection.endCol)
    const maxCol = Math.max(selection.startCol, selection.endCol)
    
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol
  }

  // Copy selected cells
  const copySelection = () => {
    if (!selection) return
    
    const minRow = Math.min(selection.startRow, selection.endRow)
    const maxRow = Math.max(selection.startRow, selection.endRow)
    const minCol = Math.min(selection.startCol, selection.endCol)
    const maxCol = Math.max(selection.startCol, selection.endCol)
    
    const copied = []
    for (let r = minRow; r <= maxRow; r++) {
      const row = []
      for (let c = minCol; c <= maxCol; c++) {
        row.push(data[r]?.[c] || '')
      }
      copied.push(row)
    }
    
    setCopiedData(copied)
    
    // Also copy to clipboard
    const text = copied.map(row => row.join('\t')).join('\n')
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  // Paste copied data (Excel-like behavior)
  const pasteSelection = () => {
    if (!copiedData || !selection) return
    
    const newData = [...data]
    // Always paste starting from the top-left of the selection
    const startRow = Math.min(selection.startRow, selection.endRow)
    const startCol = Math.min(selection.startCol, selection.endCol)
    
    copiedData.forEach((row, rIndex) => {
      row.forEach((cell, cIndex) => {
        const targetRow = startRow + rIndex
        const targetCol = startCol + cIndex
        
        // Ensure we have enough rows
        while (newData.length <= targetRow) {
          newData.push(new Array(headers.length).fill(''))
        }
        
        if (targetRow < VIRTUAL_ROWS && targetCol < headers.length) {
          if (!newData[targetRow]) newData[targetRow] = []
          newData[targetRow][targetCol] = cell
        }
      })
    })
    
    setData(newData)
    addToHistory(newData, headers, columnOrder, 'Paste')
    toast.success('Pasted')
  }

  // Delete selected cells
  const deleteSelection = () => {
    if (!selection) return
    
    const minRow = Math.min(selection.startRow, selection.endRow)
    const maxRow = Math.max(selection.startRow, selection.endRow)
    const minCol = Math.min(selection.startCol, selection.endCol)
    const maxCol = Math.max(selection.startCol, selection.endCol)
    
    const newData = [...data]
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (newData[r]) {
          newData[r][c] = ''
        }
      }
    }
    
    setData(newData)
    addToHistory(newData, headers, columnOrder, 'Delete selection')
    toast.success('Deleted')
  }

  // Context menu handlers
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    setContextMenu({ x: event.clientX, y: event.clientY })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        copySelection()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        pasteSelection()
      } else if (e.key === 'Delete') {
        deleteSelection()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selection, copiedData, historyIndex, data])

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
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Excel data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Excel-like Header Bar */}
      <div className="flex items-center justify-between h-14 px-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Grid3x3 className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">{fileName}</span>
          <Badge variant="secondary" className="ml-2">
            {data.length} rows × {headers.length} columns
          </Badge>
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
        <div className="flex items-center px-4 py-2 gap-6 flex-wrap">
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
        </div>
      </div>

      {/* Main Content Area - Table */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-950" onMouseUp={handleCellMouseUp}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full border-collapse text-sm" onContextMenu={handleContextMenu}>
            <thead className="sticky top-0 bg-gray-100 dark:bg-gray-900 z-20 shadow-sm">
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center w-16 bg-gray-50 dark:bg-gray-900 font-medium text-xs text-gray-600 dark:text-gray-400">
                  #
                </th>
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
                      onClick={(e: React.MouseEvent) => handleColumnHeaderClick(originalIndex, e)}
                    />
                  ))}
                </SortableContext>
                {/* Add empty columns for virtual grid */}
                {Array.from({ length: Math.max(0, VIRTUAL_COLS - headers.length) }).map((_, i) => (
                  <th 
                    key={`empty-${i}`}
                    className="border border-gray-300 dark:border-gray-700 px-4 py-2 min-w-[140px] bg-gray-50 dark:bg-gray-900 text-gray-400"
                  >
                    {String.fromCharCode(65 + headers.length + i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Render actual data rows */}
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="group">
                  <td 
                    className={cn(
                      "border border-gray-300 dark:border-gray-700 px-3 py-2 text-center text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 font-medium cursor-pointer",
                      selectionType === 'row' && isSelected(rowIndex, 0) && "bg-blue-100 dark:bg-blue-950"
                    )}
                    onClick={(e) => handleRowHeaderClick(rowIndex, e)}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{rowIndex + 1}</span>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 rounded"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteRow(rowIndex)
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  </td>
                  {columnOrder.map((originalIndex) => {
                    const actualColIndex = originalIndex
                    const cell = row[actualColIndex]
                    const selected = isSelected(rowIndex, actualColIndex)
                    return (
                      <td 
                        key={originalIndex}
                        className={cn(
                          "border border-gray-300 dark:border-gray-700 px-3 py-2 cursor-cell transition-colors select-none",
                          selected 
                            ? "bg-blue-200 dark:bg-blue-900 border-blue-400" 
                            : "bg-white dark:bg-gray-950 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleCellMouseDown(rowIndex, actualColIndex, e)
                        }}
                        onMouseEnter={() => handleCellMouseEnter(rowIndex, actualColIndex)}
                        onDoubleClick={() => setEditingCell({ row: rowIndex, col: actualColIndex })}
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
                  {/* Add empty cells for virtual grid */}
                  {Array.from({ length: Math.max(0, VIRTUAL_COLS - headers.length) }).map((_, i) => {
                    const colIndex = headers.length + i
                    const selected = isSelected(rowIndex, colIndex)
                    return (
                      <td 
                        key={`empty-${i}`}
                        className={cn(
                          "border border-gray-300 dark:border-gray-700 px-3 py-2 cursor-cell transition-colors select-none",
                          selected
                            ? "bg-blue-200 dark:bg-blue-900 border-blue-400"
                            : "bg-gray-50/50 dark:bg-gray-950/50 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleCellMouseDown(rowIndex, colIndex, e)
                        }}
                        onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                      >
                        <span className="block min-h-[1.5rem] text-sm"></span>
                      </td>
                    )
                  })}
                </tr>
              ))}
              {/* Add virtual empty rows */}
              {Array.from({ length: Math.max(0, Math.min(100, VIRTUAL_ROWS - data.length)) }).map((_, rowI) => {
                const rowIndex = data.length + rowI
                return (
                  <tr key={`empty-row-${rowI}`} className="group">
                    <td 
                      className={cn(
                        "border border-gray-300 dark:border-gray-700 px-3 py-2 text-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-900 font-medium cursor-pointer",
                        selectionType === 'row' && isSelected(rowIndex, 0) && "bg-blue-100 dark:bg-blue-950"
                      )}
                      onClick={(e) => handleRowHeaderClick(rowIndex, e)}
                    >
                      {rowIndex + 1}
                    </td>
                    {Array.from({ length: VIRTUAL_COLS }).map((_, colI) => {
                      const selected = isSelected(rowIndex, colI)
                      return (
                        <td 
                          key={`empty-${rowI}-${colI}`}
                          className={cn(
                            "border border-gray-300 dark:border-gray-700 px-3 py-2 cursor-cell transition-colors select-none",
                            selected
                              ? "bg-blue-200 dark:bg-blue-900 border-blue-400"
                              : "bg-gray-50/50 dark:bg-gray-950/50 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          )}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleCellMouseDown(rowIndex, colI, e)
                          }}
                          onMouseEnter={() => handleCellMouseEnter(rowIndex, colI)}
                        >
                          <span className="block min-h-[1.5rem] text-sm"></span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </DndContext>

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed z-50 bg-white dark:bg-gray-900 border rounded-md shadow-lg py-1"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onMouseLeave={closeContextMenu}
          >
            <button
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm"
              onClick={() => {
                copySelection()
                closeContextMenu()
              }}
            >
              <Copy className="h-3 w-3" />
              Copy
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm"
              onClick={() => {
                pasteSelection()
                closeContextMenu()
              }}
            >
              <ClipboardPaste className="h-3 w-3" />
              Paste
            </button>
            <div className="border-t my-1" />
            <button
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm text-red-600 dark:text-red-400"
              onClick={() => {
                deleteSelection()
                closeContextMenu()
              }}
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        )}
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
              onClick={() => router.back()}
              className="h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="h-9 px-4 bg-primary hover:bg-primary/90 text-white gap-2"
            >
              <Download className="h-4 w-4" />
              Save & Download
            </Button>
          </div>
        </div>
      </div>

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
