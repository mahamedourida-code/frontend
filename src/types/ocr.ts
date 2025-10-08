// OCR-related types

export type OCRStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ExportFormat = 'xlsx' | 'csv' | 'json';

export interface OCRFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnail?: string;
}

export interface OCRCell {
  row: number;
  col: number;
  value: string;
  confidence: number;
}

export interface OCRTable {
  rows: number;
  cols: number;
  cells: OCRCell[];
}

export interface OCRResult {
  id: string;
  userId: string;
  file: OCRFile;
  status: OCRStatus;
  table?: OCRTable;
  accuracy?: number;
  processingTime?: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OCRProcessRequest {
  file: File;
  options?: {
    language?: string;
    detectTables?: boolean;
    enhanceImage?: boolean;
  };
}

export interface OCRProcessResponse {
  id: string;
  status: OCRStatus;
  estimatedTime?: number;
}

export interface ExportRequest {
  resultId: string;
  format: ExportFormat;
  options?: {
    includeHeaders?: boolean;
    sheetName?: string;
  };
}

export interface ProcessingQueueItem {
  id: string;
  fileName: string;
  status: OCRStatus;
  progress: number;
  startedAt: Date;
}

export interface OCRHistoryItem extends OCRResult {
  exportedAt?: Date;
  exportFormat?: ExportFormat;
  shared?: boolean;
}

export interface OCRHistoryFilters {
  status?: OCRStatus;
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}

// API-specific types
export interface APIError {
  detail: string;
  status_code: number;
}

export interface UploadResponse {
  file_id: string;
  filename: string;
  status: OCRStatus;
  message: string;
}

export interface ProcessingStatusResponse {
  file_id: string;
  status: OCRStatus;
  progress: number;
  result?: OCRTable;
  error?: string;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'status_update' | 'processing_complete' | 'processing_error';
  file_id: string;
  status: OCRStatus;
  progress?: number;
  result?: OCRTable;
  error?: string;
}
