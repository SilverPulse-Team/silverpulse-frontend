import type { ReactNode } from 'react'

export type AssistantRole = 'assistant' | 'user' | 'system'

export interface AssistantMessageData {
  id: string
  role: AssistantRole
  content: ReactNode
  label?: string
}

export interface QuickReply {
  id: string
  label: string
  disabled?: boolean
}
