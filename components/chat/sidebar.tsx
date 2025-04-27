"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Brain,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Trash2,
  MoreHorizontal,
  Edit,
  Star,
  Clock,
  Search,
  CreditCard,
  User,
  MessageSquare,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { chatService } from "@/lib/chat-service"
import type { Chat } from "@/types/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import CustomNewChatButton from "@/components/ui/custom-new-chat-button"

export default function ChatSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [chatHistory, setChatHistory] = useState<Chat[]>([])
  const [isRenaming, setIsRenaming] = useState<string | null>(null)
  const [newChatName, setNewChatName] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const pathname = usePathname()

  // Load chats from Supabase on initial render
  useEffect(() => {
    const loadChats = async () => {
      setIsLoading(true)
      try {
        const chats = await chatService.getChats()
        setChatHistory(chats)
      } catch (error) {
        console.error("Failed to load chats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChats()
  }, [])

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Filter chats based on search query
  const filteredChats = chatHistory.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))

  // Separate pinned and unpinned chats
  const pinnedChats = filteredChats.filter((chat) => chat.pinned)
  const unpinnedChats = filteredChats.filter((chat) => !chat.pinned)

  // Handle chat deletion
  const handleDeleteChat = (chatId: string) => {
    setChatToDelete(chatId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteChat = async () => {
    if (chatToDelete) {
      const success = await chatService.deleteChat(chatToDelete)
      if (success) {
        setChatHistory((prevChats) => prevChats.filter((chat) => chat.id !== chatToDelete))
      }
      setIsDeleteDialogOpen(false)
      setChatToDelete(null)
    }
  }

  // Handle chat renaming
  const handleRenameChat = (chatId: string, currentName: string) => {
    setIsRenaming(chatId)
    setNewChatName(currentName)
  }

  const confirmRenameChat = async (chatId: string) => {
    if (newChatName.trim()) {
      const success = await chatService.updateChat(chatId, { title: newChatName })
      if (success) {
        setChatHistory((prevChats) =>
          prevChats.map((chat) => (chat.id === chatId ? { ...chat, title: newChatName } : chat)),
        )
      }
    }
    setIsRenaming(null)
    setNewChatName("")
  }

  // Handle chat pinning/unpinning
  const togglePinChat = async (chatId: string, currentPinned: boolean) => {
    const success = await chatService.togglePinChat(chatId, !currentPinned)
    if (success) {
      setChatHistory((prevChats) =>
        prevChats.map((chat) => (chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat)),
      )
    }
  }

  // Create a new chat
  const createNewChat = async () => {
    const newChat = await chatService.createChat()
    if (newChat) {
      setChatHistory((prev) => [newChat, ...prev])
      router.push(`/chat/${newChat.id}`)
    }
  }

  // Update the sidebar links to ensure they navigate to the correct pages
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Billing",
      href: "/billing",
      icon: <CreditCard className="h-5 w-5" />,
    },
  ]

  // Update the return statement to properly handle mobile sidebar
  return (
    <>
      <AnimatePresence>
        {/* Only render the sidebar if it's not collapsed on mobile */}
        {!(isMobile && collapsed) && (
          <motion.div
            className="bg-gray-900 border-r border-gray-800 h-screen flex flex-col transition-all duration-300 fixed md:relative z-30"
            initial={false}
            animate={{
              width: collapsed ? (isMobile ? 0 : 80) : 256,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-800">
              <Link href="/" className={`flex items-center ${collapsed ? 'pr-2' : ''}`}>
                <Brain className="h-8 w-8 text-purple-500" />
                {!collapsed && <span className="text-white font-bold text-xl ml-2">NbAIl</span>}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="text-gray-400 hover:text-white transition-transform duration-300"
              >
                {collapsed ? (
                  <ChevronRight className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
                ) : (
                  <ChevronLeft className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
                )}
              </Button>
            </div>

            {/* New Chat Button - Replace with custom button */}
            <div className="p-4 flex justify-center">
              <CustomNewChatButton onClick={createNewChat} collapsed={collapsed} />
            </div>

            {/* Search */}
            {!collapsed && (
              <div className="px-4 mb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-gray-800 border-gray-700 text-white h-9"
                  />
                </div>
              </div>
            )}

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto py-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <>
                  {!collapsed && pinnedChats.length > 0 && (
                    <div className="px-2 mb-2">
                      <p className="text-xs font-medium text-gray-400 px-3 uppercase flex items-center">
                        <Star className="h-3 w-3 mr-1" /> Pinned
                      </p>
                      <div className="mt-1 space-y-1">
                        {pinnedChats.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={pathname === `/chat/${chat.id}`}
                            isRenaming={isRenaming === chat.id}
                            newChatName={newChatName}
                            setNewChatName={setNewChatName}
                            onRename={() => confirmRenameChat(chat.id)}
                            onDelete={() => handleDeleteChat(chat.id)}
                            onRenameClick={() => handleRenameChat(chat.id, chat.title)}
                            onTogglePin={() => togglePinChat(chat.id, chat.pinned)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {!collapsed && (
                    <div className="px-2 mb-2">
                      <p className="text-xs font-medium text-gray-400 px-3 uppercase flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> Recent Chats
                      </p>
                      <div className="mt-1 space-y-1">
                        {unpinnedChats.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={pathname === `/chat/${chat.id}`}
                            isRenaming={isRenaming === chat.id}
                            newChatName={newChatName}
                            setNewChatName={setNewChatName}
                            onRename={() => confirmRenameChat(chat.id)}
                            onDelete={() => handleDeleteChat(chat.id)}
                            onRenameClick={() => handleRenameChat(chat.id, chat.title)}
                            onTogglePin={() => togglePinChat(chat.id, chat.pinned)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {collapsed &&
                    chatHistory.slice(0, 5).map((chat) => (
                      <Link
                        key={chat.id}
                        href={`/chat/${chat.id}`}
                        className="flex justify-center items-center h-10 w-10 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 mx-auto mb-2"
                      >
                        <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center">
                          <span className="text-xs">{chat.icon}</span>
                        </div>
                      </Link>
                    ))}
                </>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="p-4 border-t border-gray-800 mt-auto">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors ${
                      collapsed ? "justify-center" : ""
                    }`}
                  >
                    {item.icon}
                    {!collapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                ))}
              </div>

              {/* User Profile Section */}
              <div className={`mt-6 pt-4 border-t border-gray-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center">
                  <Avatar className={`h-8 w-8 ${collapsed ? '' : 'mr-3'}`}>
                    <AvatarImage src="/placeholder-user.jpg" alt="User Name" />
                    <AvatarFallback>NT</AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <span className="text-sm font-medium text-white truncate">
                      Nabil Thange
                    </span>
                  )}
                </div>

                {!collapsed && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="end" className="bg-gray-800 border-gray-700 text-white">
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/dashboard/profile">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem asChild className="cursor-pointer text-red-400 focus:text-red-400">
                        <Link href="/logout">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Logout</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent className="bg-gray-800 text-white border-gray-700">
                <DialogHeader>
                  <DialogTitle>Delete Chat</DialogTitle>
                </DialogHeader>
                <p className="text-gray-300">
                  Are you sure you want to delete this chat? This action cannot be undone.
                </p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDeleteChat}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat icon button that appears in the top-left corner when sidebar is collapsed on mobile */}
      {isMobile && collapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="fixed top-4 left-4 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg p-3"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      )}
    </>
  )
}

// Chat Item Component
interface ChatItemProps {
  chat: Chat
  isActive: boolean
  isRenaming: boolean
  newChatName: string
  setNewChatName: (name: string) => void
  onRename: () => void
  onDelete: () => void
  onRenameClick: () => void
  onTogglePin: () => void
}

function ChatItem({
  chat,
  isActive,
  isRenaming,
  newChatName,
  setNewChatName,
  onRename,
  onDelete,
  onRenameClick,
  onTogglePin,
}: ChatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-md ${isActive ? "bg-gray-800" : "hover:bg-gray-800/50"}`}
    >
      {isRenaming ? (
        <div className="flex items-center px-3 py-2">
          <Input
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white h-8"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onRename()
              }
            }}
            autoFocus
          />
          <Button size="sm" className="ml-2 h-8 bg-purple-600 hover:bg-purple-700" onClick={onRename}>
            Save
          </Button>
        </div>
      ) : (
        <Link
          href={`/chat/${chat.id}`}
          className="flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:text-white truncate"
        >
          <span className="mr-2">{chat.icon}</span>
          <div className="flex-1 truncate">
            <span className="truncate">{chat.title}</span>
          </div>
        </Link>
      )}

      {!isRenaming && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" sideOffset={5} className="bg-gray-800 border-gray-700 text-white">
              <DropdownMenuItem onClick={onRenameClick} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onTogglePin} className="cursor-pointer">
                <Star className="mr-2 h-4 w-4" />
                <span>{chat.pinned ? "Unpin" : "Pin"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400 cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </motion.div>
  )
}
