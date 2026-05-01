"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface ProcessedFile {
  file_id: string
  filename: string
  [key: string]: any // Allow additional properties from the API response
}

interface ProcessingState {
  uploadedFiles: File[]
  processedFiles: ProcessedFile[]
  jobId: string | null
  status: 'idle' | 'processing' | 'completed' | 'failed'
  progress: number
  lastUpdated: number
  processingComplete: boolean
}

interface ProcessingStateContextType {
  state: ProcessingState
  updateState: (newState: Partial<ProcessingState>) => void
  clearState: () => void
  saveFiles: (files: File[]) => void
  getSerializableFiles: () => any[]
  restoreFiles: (serializedFiles: any[]) => void
}

const ProcessingStateContext = createContext<ProcessingStateContextType | undefined>(undefined)

const STORAGE_KEY = 'olmocr_processing_state'
const STATE_EXPIRY_TIME = 24 * 60 * 60 * 1000 // 24 hours

const initialState: ProcessingState = {
  uploadedFiles: [],
  processedFiles: [],
  jobId: null,
  status: 'idle',
  progress: 0,
  lastUpdated: Date.now(),
  processingComplete: false
}

export function ProcessingStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProcessingState>(initialState)

  // Load state from localStorage on mount
  useEffect(() => {
    const loadState = () => {
      try {
        // Check if we're in browser
        if (typeof window === 'undefined') return
        
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          const now = Date.now()
          
          // Check if state is expired
          if (parsed.lastUpdated && (now - parsed.lastUpdated) < STATE_EXPIRY_TIME) {
            // Restore state with processed files
            setState({
              ...initialState,
              processedFiles: parsed.processedFiles || [],
              status: parsed.status || 'idle',
              jobId: parsed.jobId || null,
              progress: parsed.progress || 0,
              processingComplete: parsed.processingComplete || false,
              lastUpdated: parsed.lastUpdated
            })
            
          } else {
            // State is expired, clear it
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    loadState()
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const saveState = () => {
      try {
        // Don't try to save File objects, only save the processed files with their IDs
        const stateToSave = {
          processedFiles: state.processedFiles,
          status: state.status,
          jobId: state.jobId,
          progress: state.progress,
          processingComplete: state.processingComplete,
          lastUpdated: Date.now()
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
      } catch (error) {
        // If localStorage is full, clear old data
        if (error instanceof DOMException && error.code === 22) {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    }

    // Don't save immediately on mount
    if (state.lastUpdated !== initialState.lastUpdated) {
      saveState()
    }
  }, [state])

  const updateState = useCallback((newState: Partial<ProcessingState>) => {
    setState(prev => ({
      ...prev,
      ...newState,
      lastUpdated: Date.now()
    }))
  }, [])

  const clearState = useCallback(() => {
    setState(initialState)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Convert File objects to serializable format
  const getSerializableFiles = (): any[] => {
    if (!state.uploadedFiles || state.uploadedFiles.length === 0) {
      return []
    }

    // Note: We can't fully serialize File objects, but we can store metadata
    return state.uploadedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }))
  }

  // Save files with metadata
  const saveFiles = (files: File[]) => {
    updateState({ uploadedFiles: files })
  }

  // Restore files from serialized data (metadata only)
  const restoreFiles = (serializedFiles: any[]) => {
    // Note: We can't recreate actual File objects from localStorage
    // This is just metadata for display purposes
  }

  return (
    <ProcessingStateContext.Provider 
      value={{ 
        state, 
        updateState, 
        clearState,
        saveFiles,
        getSerializableFiles,
        restoreFiles
      }}
    >
      {children}
    </ProcessingStateContext.Provider>
  )
}

export function useProcessingState() {
  const context = useContext(ProcessingStateContext)
  if (context === undefined) {
    throw new Error('useProcessingState must be used within a ProcessingStateProvider')
  }
  return context
}
