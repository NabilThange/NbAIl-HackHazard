"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Glasses, Mic, Paperclip, X, ArrowUp, Plus, Monitor, AudioWaveform, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { SparklesCore } from "@/components/sparkles"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { chatService } from "@/lib/chat-service"
import type { Chat, Message, Attachment } from "@/types/chat"
import { getGroqChatCompletion, getGroqTranscription, getGroqVisionCompletion } from "@/lib/groq-service"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Script from "next/script"

// Import the Spline viewer script - ensure this script tag is placed appropriately,
// potentially in the head of your document or just before the spline-viewer component.
// For this example, we'll assume it can be placed near the component.
// Note: Using dangerouslySetInnerHTML for scripts loaded this way isn't standard in React/Next.js.
// A better approach might be using next/script or placing it in _document.js / _app.js.
// However, for direct replacement as requested:
const SplineScript = () => (
  <script type="module" src="https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js" async></script>
);

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = params.id as string

  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isMicActive, setIsMicActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [chat, setChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false)
  const [isVoiceRecordingOverlay, setIsVoiceRecordingOverlay] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const SILENCE_THRESHOLD = 1200 // Adjusted to 1.2 seconds

  // Mock files for the picker
  const mockFiles = [
    { name: "research_paper.pdf", size: "2.4 MB" },
    { name: "presentation.pptx", size: "5.1 MB" },
    { name: "data_analysis.xlsx", size: "1.8 MB" },
  ]

  // Load chat data from Supabase
  useEffect(() => {
    const loadChat = async () => {
      setIsLoading(true)
      try {
        const chatData = await chatService.getChatById(chatId)
        if (chatData) {
          setChat(chatData)
          const messagesData = await chatService.getMessages(chatId)
          setMessages(messagesData)
        } else {
          // If chat doesn't exist, redirect to main chat page
          router.push("/chat")
        }
      } catch (error) {
        console.error("Failed to load chat:", error)
        router.push("/chat")
      } finally {
        setIsLoading(false)
      }
    }

    if (chatId) {
      loadChat()
    }
  }, [chatId, router])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !selectedFile && !selectedImageFile) return

    // Determine user content (text or image prompt)
    const userTextContent = input || (selectedFile ? `I'm sending you this file: ${selectedFile}` : 
                           selectedImageFile ? `I've uploaded an image. ${input || 'What do you see?'}` : "")

    // Prepare attachment if any (for non-image files)
    let attachment: Attachment | undefined
    if (selectedFile) {
      attachment = {
        type: "file",
        name: selectedFile,
      }
    } else if (selectedImageFile && imageBase64) {
      // Create a temporary attachment representation for the UI
      attachment = {
        type: "image",
        name: selectedImageFile.name,
        url: imageBase64, // Use base64 for preview in UI
      }
    }

    // Add user message to UI immediately for better UX
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      chat_id: chatId,
      role: "user",
      content: userTextContent,
      created_at: new Date().toISOString(),
      attachment_type: attachment?.type,
      attachment_name: attachment?.name,
      attachment_url: attachment?.url, // Will show base64 preview for image
    }

    setMessages((prev) => [...prev, tempUserMessage])
    const currentInput = input
    const currentImageBase64 = imageBase64
    const currentImageFile = selectedImageFile
    setInput("")
    setSelectedFile(null)
    setImageBase64(null) // Clear image state
    setSelectedImageFile(null) // Clear image state

    // Save user message to database (handle potential image attachment)
    // Note: chatService.addMessage might need adjustment if you want to persist image data/urls differently
    const savedUserMessage = await chatService.addMessage(
      chatId,
      "user",
      userTextContent,
      attachment, // Passing the UI attachment representation
    )

    // Indicate assistant is thinking
    setIsTyping(true)

    try {
      let assistantResponse = ""
      // --- Check if it's an image submission ---
      if (currentImageFile && currentImageBase64) {
        assistantResponse = await getGroqVisionCompletion(
          // Use input or improved default prompt asking to read text.
          currentInput || 'start the response with "I see ".  Describe this image in detail. If there is any readable text in the image (e.g., on signs, books, screens), please include it in your description.', 
          currentImageBase64,
          currentImageFile.type
        )
      } else {
      // --- Otherwise, use standard chat completion ---
        assistantResponse = await getGroqChatCompletion(currentInput || (selectedFile ? `Analyzing file: ${selectedFile}` : ""))
      }
      // ------------------------------------------

      // Save assistant message to database
      const savedAssistantMessage = await chatService.addMessage(chatId, "assistant", assistantResponse, undefined)

      if (savedAssistantMessage) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMessage.id), // Remove temp message
          savedUserMessage || tempUserMessage, // Use saved message or fallback to temp
          savedAssistantMessage,
        ])
      } else {
        // Handle error if assistant message couldn't be saved
        console.error("Failed to save assistant message.")
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id))
      }
    } catch (error) {
      console.error("Error getting or saving assistant response:", error)
      // Show error message to the user
      const errorAssistantMessage: Message = {
        id: `temp-error-${Date.now()}`,
        chat_id: chatId,
        role: "assistant",
        content: "Sorry, I encountered an error trying to respond.",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMessage.id),
        savedUserMessage || tempUserMessage,
        errorAssistantMessage,
      ])
    } finally {
      setIsTyping(false)
    }
  }

  // --- Rewritten Audio Recording Logic ---

  // Function to handle starting the recording
  const startRecording = async () => {
    if (isRecording || typeof navigator === 'undefined' || !navigator.mediaDevices) {
      console.warn("Media devices not available or already recording.")
      return
    }

    try {
      // 1. Get Audio Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // 2. Create MediaRecorder
      // Use a specific MIME type if needed and supported, otherwise let the browser choose default (often webm)
      const options = { mimeType: 'audio/webm;codecs=opus' }; // Try webm with opus codec explicitly
      let recorder;
      try {
          recorder = new MediaRecorder(stream, options);
      } catch (e1) {
          console.warn(`MediaRecorder with ${options.mimeType} failed: ${e1}. Trying default.`);
          try {
              recorder = new MediaRecorder(stream); // Fallback to browser default
          } catch (e2) {
              console.error("MediaRecorder creation failed:", e2);
              alert("Could not create audio recorder. Your browser might not support it.");
              stream.getTracks().forEach(track => track.stop()); // Clean up stream
              return;
          }
      }
      mediaRecorderRef.current = recorder;
      console.log("Using MediaRecorder with MIME type:", mediaRecorderRef.current.mimeType);

      // 3. Clear previous chunks
      audioChunksRef.current = []

      // 4. Handle Data Available
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // 5. Handle Recording Stop
      mediaRecorderRef.current.onstop = async () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'; // Get the actual mimeType used
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const blobSize = audioBlob.size;
        console.log(`Audio Blob Size: ${blobSize} bytes, Type: ${mimeType}`);

        // Stop tracks *immediately* after creating the blob
        // We get the stream from the recorder itself if available
        mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop()); 

        // Reset recording state early
        setIsRecording(false);
        setIsMicActive(false);

        if (blobSize === 0) {
            console.error("Audio Blob is empty. Skipping transcription.");
            setInput("Error: Failed to record audio. Please try again.");
            return; // Stop execution here
        }

        setIsTranscribing(true); // Set transcribing state only if blob is valid

        try {
            const fileName = mimeType.includes('opus') ? "recording.opus" : "recording.webm";
            const audioFile = new File([audioBlob], fileName, { type: mimeType });
            const transcribedText = await getGroqTranscription(audioFile);
            console.log("Raw Transcription Result:", transcribedText);

            if (transcribedText && !transcribedText.startsWith("Sorry")) {
                // Check specifically for empty or "you" transcription
                if (transcribedText.trim() === "" || transcribedText.trim().toLowerCase() === "you") {
                    setInput("Transcription seems invalid. Please try speaking clearly.");
                    console.warn("Transcription resulted in empty or 'you'.");
                } else {
                    setInput(transcribedText);
                }
            } else {
                setInput("Transcription failed or returned an error message. Please try again.");
                console.warn("Transcription failed or returned 'Sorry'. Original text:", transcribedText);
            }
        } catch (error) {
            console.error("Transcription API call failed:", error);
            setInput("Transcription failed due to API error. Please try again.");
        } finally {
            setIsTranscribing(false);
        }
      };

      // 6. Start Recording
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setIsMicActive(true) // Update visual state
      setInput("") // Clear input field when starting recording

    } catch (error) {
      console.error("Error accessing microphone or starting recording:", error)
      alert("Could not access microphone. Please check permissions.")
      setIsMicActive(false)
      setIsRecording(false)
    }
  }

  // Function to handle stopping the recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        console.log("Stopping recording...");
        mediaRecorderRef.current.stop()
        // onstop event handles the rest (state updates, transcription)
    } else {
        console.log("Stop recording called but not currently recording.");
        // Ensure states are reset if stop is called unexpectedly
        setIsRecording(false);
        setIsMicActive(false);
    }
  }

  // --- End Rewritten Audio Recording Logic ---

  // --- Add File Handling Logic ---
  const handleFileButtonClick = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Basic validation (type and size)
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]
    const maxSize = 4 * 1024 * 1024 // 4MB limit (adjust as needed based on API)

    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please select a PNG, JPG, or JPEG image.")
      return
    }

    if (file.size > maxSize) {
      alert(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`)
      return
    }

    // Read file as Base64
    const reader = new FileReader()
    reader.onloadend = () => {
      setImageBase64(reader.result as string)
      setSelectedImageFile(file)
    }
    reader.onerror = (error) => {
      console.error("Error reading file:", error)
      alert("Failed to read file.")
      setImageBase64(null)
      setSelectedImageFile(null)
    }
    reader.readAsDataURL(file)

    // Reset file input value to allow selecting the same file again
    event.target.value = ""
  }

  const handleRemoveImage = () => {
    setImageBase64(null)
    setSelectedImageFile(null)
  }
  // -----------------------------

  // --- Voice Assistant Overlay Logic ---
  const openVoiceOverlay = () => {
    setIsVoiceOverlayOpen(true)
    // Automatically start recording when overlay opens
    // We will implement startOverlayRecording next
    // startOverlayRecording(); 
  }

  const closeVoiceOverlay = () => {
    // Stop recording if active
    if (mediaRecorderRef.current && isVoiceRecordingOverlay) {
      mediaRecorderRef.current.stop()
      // onstop will handle cleanup and processing
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    // Stop TTS if speaking
    if (isSpeaking && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
    setIsVoiceOverlayOpen(false)
    setIsVoiceRecordingOverlay(false)
  }

  // Effect to handle Escape key for closing overlay
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isVoiceOverlayOpen) {
        closeVoiceOverlay()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isVoiceOverlayOpen]) // Dependency ensures listener is added/removed correctly

  // Start recording specifically for the overlay mode
  const startOverlayRecording = async () => {
    if (isVoiceRecordingOverlay || typeof navigator === 'undefined' || !navigator.mediaDevices) {
      console.warn("Media devices not available or already recording.")
      return
    }

    console.log("Starting overlay recording...")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = [] // Reset chunks
      setIsVoiceRecordingOverlay(true)
      setIsSpeaking(false) // Ensure speaking state is reset

      // --- Silence Detection --- 
      const resetSilenceTimer = () => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
        }
        silenceTimerRef.current = setTimeout(() => {
          console.log("Silence detected, stopping recording.")
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
          }
        }, SILENCE_THRESHOLD)
      }
      // ------------------------

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          resetSilenceTimer() // Reset timer on receiving data
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        console.log("Overlay recording stopped.")
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }

        // Only process if we are in overlay mode and have chunks
        if (isVoiceOverlayOpen && audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm;codecs=opus" });
            // Log blob size before processing
            console.log(`[ChatPage] Overlay onstop: Audio Blob size: ${audioBlob.size}, chunks: ${audioChunksRef.current.length}`);
            // Process the audio for TTS response *without* adding to chat messages
            await processVoiceInput(audioBlob)
        } else {
            console.warn("[ChatPage] Overlay onstop: Skipping processing - not in overlay or no audio chunks.");
        }
        
        // Reset state regardless of processing
        setIsVoiceRecordingOverlay(false)
        audioChunksRef.current = [] // Clear chunks
        
        // Clean up the stream tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start(500) // Start recording, collect data in chunks (e.g., every 500ms)
      resetSilenceTimer() // Start initial silence timer
      console.log("Overlay recording started.")

    } catch (error) {
      console.error("Error accessing microphone for overlay:", error)
      alert("Could not access microphone. Please check permissions.")
      closeVoiceOverlay() // Close overlay if mic access fails
    }
  }

  // Placeholder for handling audio processing and TTS
  const processVoiceInput = async (audioBlob: Blob) => {
    // console.log("Processing voice input... Blob size:", audioBlob.size) // Remove log
    if (audioBlob.size === 0) {
      console.warn("[ChatPage] processVoiceInput: Skipping processing - Empty audio blob.");
      setIsVoiceRecordingOverlay(false) // Ensure state is reset
      setIsSpeaking(false)
      return
    }
    
    // Log blob size just before API call
    console.log(`[ChatPage] processVoiceInput: Processing blob size: ${audioBlob.size}`);

    setIsVoiceRecordingOverlay(false) // Recording stopped, now processing
    setIsSpeaking(true) // Indicate processing/speaking phase
    try {
      console.log("Transcribing...")
      // Revert back to audio/webm
      const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" })
      const transcription = await getGroqTranscription(audioFile)
      console.log("Transcription:", transcription)
      
      if (transcription && !transcription.toLowerCase().startsWith("sorry") && transcription.trim().length > 0) {
        console.log("Getting AI response...")
        const aiResponse = await getGroqChatCompletion(transcription)
        console.log("AI Response:", aiResponse)
        speakText(aiResponse)
      } else {
        console.log("Transcription failed or empty, not sending to AI.")
        speakText("Sorry, I couldn't understand that. Please try again.") // Speak clarification
      }
    } catch (error) {
      console.error("Error processing voice input:", error)
      speakText("Sorry, I encountered an error processing your request.") // Speak error
    } finally {
      // TTS onend handles setIsSpeaking(false)
    }
  }

  // TTS Function
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn("Speech synthesis not supported.")
      setIsSpeaking(false)
      closeVoiceOverlay() // Close overlay even if TTS fails
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
        console.log("TTS finished.")
        setIsSpeaking(false)
        closeVoiceOverlay() // Automatically close overlay after speaking
    }
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error)
      setIsSpeaking(false)
      closeVoiceOverlay() // Close overlay on TTS error
    }
    
    // Optional: Select a voice
    // const voices = window.speechSynthesis.getVoices();
    // utterance.voice = voices[/* index of desired voice */]; 

    window.speechSynthesis.speak(utterance)
  }

  // Effect to start recording when overlay opens
  useEffect(() => {
    if (isVoiceOverlayOpen) {
      startOverlayRecording();
    }
    // No cleanup needed here as closeVoiceOverlay handles stopping
  }, [isVoiceOverlayOpen])

  // If still loading or no chat is found, show loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black/[0.96]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-screen bg-black/[0.96]">
        <div className="text-white">Chat not found. Redirecting...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-x-hidden">
      {/* Black overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>
      {/* Interactive background with moving particles */}
      <div className="h-full w-full absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={50} // Reduced density for better performance
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      {/* Chat messages */}
      <main className="flex-1 overflow-y-auto px-4 pt-16 pb-0 md:px-6 md:pt-16 md:pb-0 relative z-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            // Replace the empty chat message with the Spline viewer
            <div className="flex flex-col items-center justify-center min-h-[60vh] md:min-h-[calc(100vh-200px)]">
              {/* Ensure the script is loaded */}
              <SplineScript />
              {/* Spline Viewer Embed */}
              {/* ts-ignore Property 'spline-viewer' does not exist on type 'JSX.IntrinsicElements'. */}
              <spline-viewer
                url="https://prod.spline.design/qCEGpu69o0sy21p3/scene.splinecode"
                style={{
                  width: '100%',
                  height: '600px', // Increased height
                  maxHeight: '80vh', // Increased max height
                  borderRadius: '12px',
                  overflow: 'hidden',
                  margin: 'auto', // Center horizontally
                }}
              >{/* ts-ignore */}</spline-viewer>
            </div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} chat-bubble-in`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-gray-700/80 text-white"
                      : "bg-gray-800/90 backdrop-blur-sm border border-gray-700 text-white"
                  }`}
                >
                  {/* --- Render Markdown for AI messages --- */}
                  {message.role === 'assistant' ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({node, ...props}) => <a {...props} className="text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer" />, 
                        code: ({node, className, children, ...props}) => { 
                          const inline = (props as any).inline; // Use type assertion
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <pre className="bg-black/30 p-2 rounded my-2 overflow-x-auto">
                              <code className={`language-${match[1]}`} {...props}>
                                {String(children).replace(/\n$/, '')}
                              </code>
                            </pre>
                          ) : (
                            <code className="bg-gray-600/50 px-1 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          );
                        },
                        p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />, 
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content // Render user message content directly
                  )}

                  {/* Render attachment if present */}
                  {message.attachment_type && (
                    <div className="mt-2">
                      {message.attachment_type === "file" && (
                        <div className="flex items-center p-2 bg-gray-700/50 rounded-md">
                          <Paperclip className="h-4 w-4 mr-2 text-gray-300" />
                          <span className="text-sm text-gray-300">{message.attachment_name}</span>
                        </div>
                      )}
                      {message.attachment_type === "image" && message.attachment_url && (
                        <div className="mt-2 rounded-md overflow-hidden">
                          <img
                            src={message.attachment_url || "/placeholder.svg"}
                            alt="Attached image"
                            className="w-full h-auto max-h-60 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}

          {/* Typing indicator -> Replaced with Thinking Animation */} 
          <AnimatePresence>
            {isTyping && (
              <motion.div
                key="thinking-indicator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-start pl-4"
              >
                {/* --- Thinking Animation Structure --- */}
                <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                  <div className="thinking-wrapper">
                    <div className="circle"></div>
                    <div className="circle"></div>
                    <div className="circle"></div>
                    <div className="shadow"></div>
                    <div className="shadow"></div>
                    <div className="shadow"></div>
                  </div>
                </div>
                {/* --- End Thinking Animation --- */}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* File Picker Modal */}
      {isFilePickerOpen && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20 bg-gray-800 rounded-lg border border-gray-700 shadow-xl w-80 sm:w-96 animate-in slide-in-from-bottom duration-300">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-medium">Select a file</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-white"
                onClick={() => setIsFilePickerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mockFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center p-2 bg-gray-700/50 rounded-md cursor-pointer hover:bg-gray-700 transition-colors hover:scale-105 active:scale-95"
                  onClick={() => {
                    setSelectedFile(file.name)
                    setIsFilePickerOpen(false)
                  }}
                >
                  <Paperclip className="h-4 w-4 mr-2 text-gray-300" />
                  <div className="flex-1">
                    <p className="text-sm text-white">{file.name}</p>
                    <p className="text-xs text-gray-400">{file.size}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-300 border-gray-600 hover:scale-105 active:scale-95"
                onClick={() => setIsFilePickerOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 active:scale-95"
                onClick={() => setIsFilePickerOpen(false)}
              >
                Upload New File
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input area & Image Preview */} 
      <div className="border-t border-gray-800 p-4 relative z-10">
        {/* Image Preview Section */} 
        {imageBase64 && (
          <div className="max-w-3xl mx-auto mb-2">
            <div className="relative inline-block bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-lg p-1">
              <img 
                src={imageBase64} 
                alt="Selected preview" 
                className="h-16 w-auto max-w-xs rounded object-contain"
              />
              <button 
                onClick={handleRemoveImage} 
                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 h-5 w-5 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
        {/* End Image Preview Section */} 

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Main input container - ChatGPT style rounded pill */}
            <div className="flex items-center justify-between bg-gray-900/80 backdrop-blur-md rounded-full border border-gray-800 hover:border-purple-500/50 transition-all duration-200">
              {/* Left side buttons */}
              <div className="flex items-center pl-2 space-x-1 sm:space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800/50 transition-all duration-200 hover:scale-105 active:scale-95"
                        onClick={handleFileButtonClick}
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Add Image</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/ar-mode"
                        className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800/50 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                      >
                        <Glasses className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>AR Mode</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/screen-aware"
                        className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800/50 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                      >
                        <Monitor className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>ScreenAware Mode</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Input field */}
              <div className="flex-1 px-2">
                <Input
                  type="text"
                  placeholder={
                    isRecording ? "🎤 NbAIl is listening to you..." :
                    isTranscribing ? "🧠 Transcribing your thoughts..." :
                    "Ask anything to NbAIl..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder-gray-400"
                  disabled={isTranscribing || isRecording}
                />
              </div>

              {/* Right side buttons */}
              <div className="flex items-center pr-2 space-x-1 sm:space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={`p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800/50 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center ${isRecording ? 'bg-red-500/30' : ''} ${isTranscribing ? 'cursor-not-allowed' : ''}`}
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        disabled={isTranscribing}
                      >
                        {isTranscribing ? (
                          <div className="loader"></div>
                        ) : (
                          <>
                            <Mic className={`h-5 w-5 ${isMicActive ? "text-purple-500 animate-pulse" : ""} ${isRecording ? "text-red-500" : ""}`} />
                            {isMicActive && !isRecording && (
                              <span className="absolute -inset-1 rounded-full animate-ping bg-purple-500/20"></span>
                            )}
                          </>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{isRecording ? "Stop Recording" : isTranscribing ? "Transcribing..." : "Hold to Speak"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type={input.trim() || selectedImageFile ? "submit" : "button"}
                        onClick={(e) => {
                          if (input.trim() || selectedImageFile) {
                            handleSubmit(e)
                          } else {
                            setIsVoiceOverlayOpen(true)
                          }
                        }}
                        disabled={isTranscribing || isRecording}
                        className={`p-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                          input.trim() || selectedImageFile
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-gray-700 hover:bg-gray-600 text-purple-400"
                        }`}
                      >
                        {input.trim() || selectedImageFile ? (
                          <ArrowUp className="h-5 w-5" />
                        ) : (
                          <AudioWaveform className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{input.trim() || selectedImageFile ? "Send Message" : "Activate Voice Assistant"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg"
              style={{ display: "none" }}
            />
          </div>
        </div>
      </div>

      {/* Voice Assistant Overlay */} 
      <AnimatePresence>
        {isVoiceOverlayOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-4"
            onClick={(e) => { 
              if (e.target === e.currentTarget) {
                // closeVoiceOverlay(); // Might be too sensitive
              }
            }}
          >
            {/* Spline Viewer as Background */} 
            {/* @ts-ignore */} 
            <spline-viewer
              url="https://prod.spline.design/IuYdAhKFWxs0vp0f/scene.splinecode"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1, // Behind controls
              }}
            />

            {/* Close Button (ensure it's above spline) */} 
            <button
              onClick={closeVoiceOverlay}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors p-2 rounded-full bg-white/10 hover:bg-white/20 z-10" // Increased z-index
              aria-label="Close voice assistant"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Microphone/Status Indicator (ensure it's above spline) */} 
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center z-10 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full"> {/* Increased z-index & added background */} 
              {isVoiceRecordingOverlay && !isSpeaking && (
                <div className="flex items-center space-x-2 text-purple-300 animate-pulse">
                  <Mic className="h-5 w-5" />
                  <span className="text-sm">Listening...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center space-x-2 text-green-300">
                  <AudioWaveform className="h-5 w-5 animate-pulse" />
                  <span className="text-sm">Speaking...</span>
                </div>
              )}
              {!isVoiceRecordingOverlay && !isSpeaking && (
                 <div className="flex items-center space-x-2 text-gray-400">
                   <Mic className="h-5 w-5" />
                   <span className="text-sm">Processing...</span> {/* Updated message */} 
                 </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load Spline Viewer Script */}
      {/* Ensure Spline script loads before the component tries to render it */}
      <Script
        src="https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js"
        strategy="beforeInteractive"
      />
    </div>
  )
}
