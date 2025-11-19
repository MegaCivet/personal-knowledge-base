import type { Source } from './api'

export interface TagManagerProps {
  open: boolean
  onClose: () => void
  onTagsChanged: () => void
}

export interface SourceListProps {
  sources: Source[]
}

export interface Message {
  sender: 'user' | 'bot'
  text: string
  sources?: Source[]
}