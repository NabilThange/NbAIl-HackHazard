"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Brain, ArrowLeft, MessageSquare, Search, Plus, Trash2, MoreHorizontal, Star, AlertTriangle } from "lucide-react"
import { SparklesCore } from "@/components/sparkles"
import ChatOptionsCard from "@/components/chat/ChatOptionsCard"
import { chatService } from "@/lib/chat-service"

// Error component
const ChatError = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-black/[0.96] text-white">
    <div className="text-red-500 text-xl mb-4 flex items-center">
      <AlertTriangle className="mr-2" />
      Error
    </div>
    <p className="mb-4 text-center">{message}</p>
    <div className="flex space-x-4">
      <Button 
        onClick={() => window.location.reload()}
        className="bg-gray-700 hover:bg-gray-600"
      >
        Try Again
      </Button>
      <Link href="/">
        <Button className="bg-purple-600 hover:bg-purple-700">
          Go to Home
        </Button>
      </Link>
    </div>
  </div>
)

export default function AllChatsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<any[]>([])

  // Placeholder for pinning/unpinning a chat
  const handlePinToggle = (chatId: string, pinned: boolean) => {
    console.log(`Attempting to ${pinned ? 'pin' : 'unpin'} chat ${chatId}`);
    // TODO: Implement actual pin/unpin logic here
  };

  // Placeholder for deleting a chat
  const handleDeleteChat = (chatId: string) => {
    console.log(`Attempting to delete chat ${chatId}`);
    // TODO: Implement actual delete logic here
  };

  // Fetch chats from the database
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chats = await chatService.getChats()
        setChatHistory(chats)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching chats:", error)
        setError("Unable to load chats. Database connection may be unavailable.")
        setIsLoading(false)
      }
    }

    fetchChats()
  }, [])

  // Filter chats based on search query
  const filteredChats = chatHistory.filter(
    (chat) =>
      chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Separate pinned and unpinned chats
  const pinnedChats = filteredChats.filter((chat) => chat.pinned)
  const unpinnedChats = filteredChats.filter((chat) => !chat.pinned)

  if (error) {
    return <ChatError message={error} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative flex items-center justify-center text-white">
        Loading chats...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-x-hidden">
      {/* Interactive background with moving particles */}
      <div className="h-full w-full absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={30}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <header className="border-b border-gray-800 glass fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/chat" className="text-gray-400 hover:text-white mr-4 flex items-center">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only md:not-sr-only md:inline-block md:ml-2">Back to Assistant</span>
            </Link>
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 text-purple-500 mr-2" />
              <h1 className="text-white font-medium text-lg">All Chats</h1>
            </div>
          </div>
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-500" />
            <span className="text-white font-bold">NbAIl</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-16 relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Link href="/chat">
              <Button className="ml-4 bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </Link>
          </div>

          {/* Pinned Chats */}
          {pinnedChats.length > 0 && (
            <div className="mb-8">
              <h2 className="text-white font-medium mb-4 flex items-center">
                <Star className="h-4 w-4 text-purple-500 mr-2" />
                Pinned Chats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnedChats.map((chat) => (
                  <ChatCard 
                    key={chat.id} 
                    chat={chat} 
                    onPinToggle={handlePinToggle}
                    onDelete={handleDeleteChat}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Chats */}
          <div>
            <h2 className="text-white font-medium mb-4">Recent Chats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unpinnedChats.length > 0 ? (
                unpinnedChats.map((chat) => <ChatCard 
                  key={chat.id} 
                  chat={chat} 
                  onPinToggle={handlePinToggle}
                  onDelete={handleDeleteChat}
                />)
              ) : (
                <p className="text-gray-400 col-span-2">
                  {isLoading 
                    ? "Loading chats..." 
                    : searchQuery && chatHistory.length > 0 
                      ? "No chats found matching your search." 
                      : "You have no recent chats."
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function ChatCard({ chat, onPinToggle, onDelete }: { chat: any; onPinToggle: (chatId: string, pinned: boolean) => void; onDelete: (chatId: string) => void }) {
  return (
    <Card className="bg-gray-800/90 backdrop-blur-md border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
      <CardHeader className="flex flex-row items-start justify-between p-4">
        <Link href={`/chat/${chat.id}`} className="flex-1">
          <CardTitle className="text-white text-lg">{chat.title}</CardTitle>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-400">
              {new Date(chat.updated_at || chat.created_at).toLocaleDateString()} • 
              {new Date(chat.updated_at || chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {chat.pinned && (
              <span className="ml-2 bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">Pinned</span>
            )}
          </div>
        </Link>
        <ChatOptionsCard chat={chat} onPinToggle={onPinToggle} onDelete={onDelete} />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-gray-300 text-sm line-clamp-2">
          {chat.preview || "Start a new conversation with NbAIl..."}
        </p>
      </CardContent>
    </Card>
  )
}
