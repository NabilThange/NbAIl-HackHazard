export type Chat = {
  id: string
  title: string
  created_at: string
  updated_at: string
  pinned: boolean
  icon?: string
  user_id?: string
}

export type Message = {
  id: string
  chat_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
  attachment_type?: string
  attachment_name?: string
  attachment_url?: string
}

export type Attachment = {
  type: "image" | "file"
  name?: string
  url?: string
}
