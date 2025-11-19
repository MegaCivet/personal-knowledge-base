export interface KnowledgeFile {
  id: string
  filename: string
  tag?: string
  created_at: string
  updated_at: string
}

export interface TagItem {
  id: string
  name: string
  created_at: string
}

export interface Source {
  filename: string
  content: string
  file_id: string
  start_index: number
  tag?: string
}

export interface QueryResponse {
  answer: string
  sources: Source[]
}

export interface UploadOptions {
  onSuccess?: (data: any) => void
  onError?: (err: any) => void
  file: File | any
  onProgress?: (event: { percent: number }) => void
  tag?: string
}