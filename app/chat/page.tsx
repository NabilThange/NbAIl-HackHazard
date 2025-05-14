"use client"

import type React from "react"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { chatService } from "@/lib/chat-service"
import dynamic from "next/dynamic"

// Dynamically import components
const DynamicChatContent = dynamic(() => import("@/components/chat/chat-content"), {
  ssr: false,
  loading: () => <ChatLoading />,
})

// Loading component
const ChatLoading = () => (
  <div className="flex items-center justify-center h-screen bg-black/[0.96]">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
  </div>
)

// Error component
const ChatError = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-black/[0.96] text-white">
    <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
    <p className="mb-4 text-center">{message}</p>
    <button 
      onClick={() => window.location.href = '/'}
      className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors"
    >
      Go to Home
    </button>
  </div>
)

// Update the Message type to include attachments
type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  attachment?: {
    type: "image" | "file"
    name?: string
    url?: string
  }
}

export default function ChatPage() {
  const router = useRouter()
  // Add these state variables at the top of the component with other state variables
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm NbAIl, your multimodal AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMicActive, setIsMicActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [redirectAttempts, setRedirectAttempts] = useState(0)

  // Add mock files for the picker
  const mockFiles = [
    { name: "research_paper.pdf", size: "2.4 MB" },
    { name: "presentation.pptx", size: "5.1 MB" },
    { name: "data_analysis.xlsx", size: "1.8 MB" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Update the handleSubmit function to handle attachments
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !selectedFile) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || (selectedFile ? `I'm sending you this file: ${selectedFile}` : ""),
      timestamp: new Date(),
      attachment: selectedFile ? { type: "file", name: selectedFile } : undefined,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setSelectedFile(null)

    // Simulate assistant typing
    setIsTyping(true)

    // Simulate assistant response after a delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAssistantResponse(input, userMessage.attachment),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  // Update the getAssistantResponse function to handle attachments
  const getAssistantResponse = (userInput: string, attachment?: Message["attachment"]): string => {
    if (attachment) {
      if (attachment.type === "file") {
        return `I've received your file "${attachment.name}". I'll analyze its contents and provide insights shortly. Is there anything specific you'd like to know about this file?`
      } else if (attachment.type === "image") {
        return "I can see the image you've shared. It appears to be a diagram or chart. Would you like me to analyze its contents or explain what I'm seeing?"
      }
    }

    const input = userInput.toLowerCase()

    if (input.includes("hello") || input.includes("hi")) {
      return "Hello there! How can I assist you today?"
    } else if (input.includes("help")) {
      return "I'm here to help! I can answer questions, analyze documents, understand your screen, and much more. What would you like to know?"
    } else if (input.includes("ar mode") || input.includes("augmented reality")) {
      return "AR Mode allows me to overlay helpful information in your field of view. You can enable it by clicking the AR Mode button in the chat interface."
    } else if (input.includes("screen") || input.includes("screenaware")) {
      return "ScreenAware lets me see and understand what's on your screen to provide contextual assistance. Enable it by clicking the ScreenAware button."
    } else if (input.includes("feature") || input.includes("can you")) {
      return "I have several capabilities including voice interaction, screen awareness, document understanding, AR mode, and chat memory. What would you like to try?"
    } else {
      return "I understand your message. As a multimodal AI assistant, I can help with various tasks. Would you like to try using my screen awareness or AR features?"
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isMicActive) {
      timer = setTimeout(() => {
        setIsMicActive(false)
        // Simulate receiving a voice message
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: "Can you explain how AR Mode works?",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])

        // Simulate assistant typing
        setIsTyping(true)
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "AR Mode allows me to overlay helpful information in your field of view. You can enable it by clicking the AR Mode button in the chat interface. It uses your device's camera to understand your environment and provide contextual assistance.",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, assistantMessage])
          setIsTyping(false)
        }, 2000)
      }, 3000)
    }

    return () => clearTimeout(timer)
  }, [isMicActive])

  // Add this effect to load mock conversations from localStorage
  // Add this after the other useEffect hooks
  useEffect(() => {
    // Check if there's a stored conversation in localStorage
    const storedChatId = localStorage.getItem("currentChatId")
    const storedMessages = localStorage.getItem("currentChatMessages")

    if (storedChatId && storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages)
        // Only set messages if we have valid data
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages)
        }
      } catch (error) {
        console.error("Failed to parse stored messages:", error)
      }
    }
  }, [])

  useEffect(() => {
    const createOrRedirectToChat = async () => {
      try {
        // Set a maximum number of redirect attempts to prevent infinite loops
        if (redirectAttempts >= 3) {
          throw new Error("Unable to connect to chat service. Database connection may be unavailable.")
        }
        
        setRedirectAttempts(prev => prev + 1)
        
        // Check if there are any existing chats
        const chats = await chatService.getChats()

        if (chats.length > 0) {
          // Redirect to the most recent chat
          router.push(`/chat/${chats[0].id}`)
        } else {
          // Create a new chat if no chats exist
          const newChat = await chatService.createChat("New Chat")
          if (newChat) {
            router.push(`/chat/${newChat.id}`)
          } else {
            throw new Error("Failed to create a new chat")
          }
        }
      } catch (error) {
        console.error("Failed to load or create chat:", error)
        setError(error instanceof Error ? error.message : "Failed to connect to the chat service")
      } finally {
        setIsLoading(false)
      }
    }

    createOrRedirectToChat()
  }, [router, redirectAttempts])

  const createNewChat = () => {
    const newChatId = Date.now().toString()
    const newChat = {
      id: newChatId,
      title: "New Chat",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      icon: "💬",
      pinned: false,
      preview: "Start a new conversation with NbAIl...",
      messages: [],
      timestamp: Date.now(),
    }

    // Save to localStorage
    localStorage.setItem("chatHistory", JSON.stringify([newChat]))
    localStorage.setItem("currentChatId", newChatId)
    localStorage.setItem("currentChatMessages", JSON.stringify([]))

    // Redirect to the new chat
    router.push(`/chat/${newChatId}`)
  }

  if (isLoading) {
    return <ChatLoading />
  }

  if (error) {
    return <ChatError message={error} />
  }

  return (
    <Suspense fallback={<ChatLoading />}>
      <DynamicChatContent />
    </Suspense>
  )
}
