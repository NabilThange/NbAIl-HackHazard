import { getSupabaseBrowserClient } from "./supabase"
import type { Chat, Message, Attachment } from "@/types/chat"

// Helper functions for localStorage fallback
const getLocalChats = (): Chat[] => {
  try {
    const localChats = localStorage.getItem("localChats")
    return localChats ? JSON.parse(localChats) : []
  } catch (error) {
    console.error("Error reading local chats:", error)
    return []
  }
}

const saveLocalChats = (chats: Chat[]) => {
  try {
    localStorage.setItem("localChats", JSON.stringify(chats))
  } catch (error) {
    console.error("Error saving local chats:", error)
  }
}

const getLocalMessages = (chatId: string): Message[] => {
  try {
    const key = `localMessages_${chatId}`
    const messages = localStorage.getItem(key)
    return messages ? JSON.parse(messages) : []
  } catch (error) {
    console.error("Error reading local messages:", error)
    return []
  }
}

const saveLocalMessages = (chatId: string, messages: Message[]) => {
  try {
    const key = `localMessages_${chatId}`
    localStorage.setItem(key, JSON.stringify(messages))
  } catch (error) {
    console.error("Error saving local messages:", error)
  }
}

export const chatService = {
  // Create a new chat
  async createChat(title = "New Chat"): Promise<Chat | null> {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.from("chats").insert([{ title }]).select().single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error("Error creating chat in Supabase, using localStorage fallback:", error)
      
      // Fallback to localStorage
      const localChats = getLocalChats()
      const newChat: Chat = {
        id: Date.now().toString(),
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "local_user",
        pinned: false
      }
      
      localChats.unshift(newChat)
      saveLocalChats(localChats)
      
      return newChat
    }
  },

  // Get all chats
  async getChats(): Promise<Chat[]> {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.from("chats").select("*").order("updated_at", { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error fetching chats from Supabase, using localStorage fallback:", error)
      
      // Fallback to localStorage
      return getLocalChats()
    }
  },

  // Get a single chat by ID
  async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.from("chats").select("*").eq("id", chatId).single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error("Error fetching chat from Supabase, using localStorage fallback:", error)
      
      // Fallback to localStorage
      const localChats = getLocalChats()
      return localChats.find(chat => chat.id === chatId) || null
    }
  },

  // Update chat details
  async updateChat(chatId: string, updates: Partial<Chat>): Promise<boolean> {
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase
        .from("chats")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", chatId)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error("Error updating chat in Supabase, using localStorage fallback:", error)
      
      // Fallback to localStorage
      const localChats = getLocalChats()
      const chatIndex = localChats.findIndex(chat => chat.id === chatId)
      
      if (chatIndex !== -1) {
        localChats[chatIndex] = {
          ...localChats[chatIndex],
          ...updates,
          updated_at: new Date().toISOString()
        }
        saveLocalChats(localChats)
        return true
      }
      
      return false
    }
  },

  // Delete a chat
  async deleteChat(chatId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from("chats").delete().eq("id", chatId)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error("Error deleting chat from Supabase, using localStorage fallback:", error)
      
      // Fallback to localStorage
      const localChats = getLocalChats()
      const updatedChats = localChats.filter(chat => chat.id !== chatId)
      saveLocalChats(updatedChats)
      
      // Remove chat messages from localStorage
      try {
        localStorage.removeItem(`localMessages_${chatId}`)
      } catch (e) {
        console.error("Error removing chat messages:", e)
      }
      
      return true
    }
  },

  // Toggle pin status
  async togglePinChat(chatId: string, isPinned: boolean): Promise<boolean> {
    return this.updateChat(chatId, { pinned: isPinned })
  },

  // Get messages for a chat
  async getMessages(chatId: string): Promise<Message[]> {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error fetching messages from Supabase, using localStorage fallback:", error)
      
      // Fallback to localStorage
      return getLocalMessages(chatId)
    }
  },

  // Add a message to a chat
  async addMessage(
    chatId: string,
    role: "user" | "assistant",
    content: string,
    attachment?: Attachment,
  ): Promise<Message | null> {
    try {
      const supabase = getSupabaseBrowserClient()
      const message = {
        chat_id: chatId,
        role,
        content,
        attachment_type: attachment?.type,
        attachment_name: attachment?.name,
        attachment_url: attachment?.url,
      }

      const { data, error } = await supabase.from("messages").insert([message]).select().single()

      if (error) {
        throw error
      }

      // Update the chat's updated_at timestamp
      await this.updateChat(chatId, {})

      return data
    } catch (error) {
      console.error("Error adding message to Supabase, using localStorage fallback:", error)
      
      // Fallback to localStorage
      const localMessages = getLocalMessages(chatId)
      const newMessage: Message = {
        id: Date.now().toString(),
        chat_id: chatId,
        role,
        content,
        created_at: new Date().toISOString(),
        attachment_type: attachment?.type,
        attachment_name: attachment?.name,
        attachment_url: attachment?.url,
      }
      
      localMessages.push(newMessage)
      saveLocalMessages(chatId, localMessages)
      
      // Update the chat's updated_at timestamp
      this.updateChat(chatId, {})
      
      return newMessage
    }
  },
}
