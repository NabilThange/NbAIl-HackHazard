"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera, Mic, Loader2, AlertTriangle, Volume2, X, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
// Import the new service function
import { getGroqVisionAnalysis, getGroqTranscription } from "@/lib/groq-service"
import { speakText } from "@/lib/tts-service"

export default function ARModePage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [userQuery, setUserQuery] = useState("Describe what you see in detail.")
  const [isMicListening, setIsMicListening] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isFrontCamera, setIsFrontCamera] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Function to setup camera
  const setupCamera = useCallback(async () => {
    setError(null)
    // Stop previous stream if it exists (important when flipping)
    setStream(currentStream => {
      if (currentStream) {
        console.log("Stopping previous camera stream...")
        currentStream.getTracks().forEach((track) => track.stop())
      }
      return null;
    });
    console.log(`Attempting to access ${isFrontCamera ? 'front' : 'rear'} camera...`)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isFrontCamera ? "user" : "environment" },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      if (err instanceof Error) {
         if (err.name === "NotAllowedError") {
          setError("Camera permission denied. Please enable camera access in your browser settings.")
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            setError("No suitable camera found. Please ensure a camera is connected and enabled.");
        } else {
           setError(`Error accessing camera: ${err.message}`)
        }
      } else {
         setError("An unknown error occurred while accessing the camera.")
      }
    }
  }, [isFrontCamera])

  // Setup camera on mount and when isFrontCamera changes
  useEffect(() => {
    setupCamera()

    // Cleanup stream on unmount
    return () => {
      setStream(currentStream => {
        if (currentStream) {
          console.log("Cleaning up camera stream...")
          currentStream.getTracks().forEach((track) => track.stop())
        }
        return null; // Ensure stream state is reset
      });
    }
  }, [setupCamera, isFrontCamera])

  // Function to capture frame
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref not available")
      return null
    }
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext("2d")
    if (!context) {
        console.error("Could not get canvas context")
        return null
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    // Convert to base64 JPEG
    try {
      return canvas.toDataURL("image/jpeg", 0.9) // Adjust quality as needed
    } catch (e) {
      console.error("Error converting canvas to data URL:", e)
      setError("Failed to capture frame.")
      return null
    }
  }, [])

  // Function to handle analysis
  const handleAnalyzeImage = useCallback(async () => {
    setStatusMessage("Capturing image...")
    setIsAnalyzing(true)
    setAiResponse(null)
    setError(null)
    const imageDataUrl = captureFrame()

    if (!imageDataUrl) {
      setIsAnalyzing(false)
      setStatusMessage(null)
      setError("Could not capture frame for analysis.")
      return
    }

    setStatusMessage("Analyzing image...")
    console.log("Frame captured, sending for analysis...")

    try {
      // Use the default query when only image is captured
      const response = await getGroqVisionAnalysis(imageDataUrl, "Describe what you see in detail.")
      setAiResponse(response)
      setStatusMessage(null) // Clear status on success
      // Optionally speak the response
      // speakText(response, () => setIsSpeaking(true), () => setIsSpeaking(false), (err) => console.error(err));

    } catch (err) {
      console.error("Error analyzing image:", err)
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis."
      setError(`Analysis failed: ${errorMessage}`)
      setStatusMessage(null)
    } finally {
      setIsAnalyzing(false)
    }
  }, [captureFrame])

  // --- Flip Camera ---
  const handleFlipCamera = () => {
    console.log("Flipping camera...")
    setIsFrontCamera((prev) => !prev)
    // State update will trigger useEffect to call setupCamera
  }

  // --- Microphone Toggle Logic ---
  const handleMicToggle = () => {
    if (isMicListening) {
      stopMicListener();
    } else {
      startMicListener();
    }
  }

  // --- Start Mic Listener ---
  const startMicListener = async () => {
    if (isMicListening || typeof navigator === 'undefined' || !navigator.mediaDevices) {
      console.warn("Media devices not available or already listening.")
      return
    }
    setError(null)
    setAiResponse(null)
    setStatusMessage("Listening...")
    console.log("Starting microphone listener...")

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      mediaRecorderRef.current = new MediaRecorder(audioStream)
      audioChunksRef.current = []
      setIsMicListening(true) // Set listening state
      setIsSpeaking(false)
      setIsTranscribing(false)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        console.log("Mic listener stopped manually.")
        // Reset listening state *before* processing
        setIsMicListening(false)
        setStatusMessage("Transcribing...")
        setIsTranscribing(true)

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const recordedChunks = [...audioChunksRef.current] // Copy chunks before clearing
        audioChunksRef.current = [] // Clear chunks immediately
        
        // Stop the tracks *after* creating the Blob
        audioStream.getTracks().forEach(track => track.stop())

        if (recordedChunks.length === 0 || audioBlob.size === 0) {
          console.warn("Empty audio recorded.")
          setStatusMessage(null)
          setIsTranscribing(false)
          setError("Couldn't hear anything. Please try speaking again.")
          return
        }

        try {
          const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" })
          const transcription = await getGroqTranscription(audioFile)
          console.log("Transcription:", transcription)
          setIsTranscribing(false)

          if (!transcription || transcription.toLowerCase().startsWith("sorry")) {
            setError("Could not understand audio. Please try again.")
            setStatusMessage(null)
            return
          }
          
          // Now that we have transcription, capture frame and analyze
          await handleAnalyzeVoice(transcription)

        } catch (transcriptionError) {
          console.error("Transcription error:", transcriptionError)
          setError("Failed to transcribe audio.")
          setStatusMessage(null)
          setIsTranscribing(false)
        }
      }

      mediaRecorderRef.current.start(500) // Collect data in chunks
      console.log("Microphone listener started.")

    } catch (err) {
      console.error("Error accessing microphone:", err)
      alert("Could not access microphone. Please check permissions.")
      setStatusMessage(null)
      setIsMicListening(false)
    }
  }

  // --- Stop Mic Listener (Manual) ---
  const stopMicListener = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log("Manually stopping mic listener...")
      mediaRecorderRef.current.stop() // This triggers the onstop handler
    } else {
      console.log("Mic listener was not recording.")
      setIsMicListening(false) // Ensure state is reset if somehow it wasn't recording
      setStatusMessage(null)
    }
  }

  // --- Analysis Function (Voice Input) ---
  const handleAnalyzeVoice = useCallback(async (transcribedQuery: string) => {
    setStatusMessage("Capturing image...")
    setIsAnalyzing(true)
    setAiResponse(null)
    setError(null)
    const imageDataUrl = captureFrame()

    if (!imageDataUrl) {
      setIsAnalyzing(false)
      setStatusMessage(null)
      setError("Could not capture frame for analysis.")
      return
    }

    setStatusMessage("Analyzing image with your query...")
    console.log(`Frame captured, analyzing with query: "${transcribedQuery}"`) 

    try {
      const response = await getGroqVisionAnalysis(imageDataUrl, transcribedQuery)
      setAiResponse(response)
      setStatusMessage("Speaking response...") 
      // Speak the response
      speakText(
         response,
         () => { console.log("TTS started"); setIsSpeaking(true); setStatusMessage("Speaking..."); },
         () => { console.log("TTS ended"); setIsSpeaking(false); setStatusMessage(null); setAiResponse(null); /* Auto-hide response */ },
         (err) => { 
             console.error("TTS Error:", err);
             setError("Error speaking the response.");
             setIsSpeaking(false);
             setStatusMessage(null);
         }
       );

    } catch (err) {
      console.error("Error analyzing image with voice query:", err)
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis."
      setError(`Analysis failed: ${errorMessage}`)
      setStatusMessage(null)
    } finally {
      setIsAnalyzing(false) 
      // Don't set isSpeaking false here, TTS callback handles it
    }
  }, [captureFrame]) // Removed userQuery dependency

  return (
    <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
      {/* Header */} 
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-20 bg-gradient-to-b from-black/50 to-transparent">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-white bg-white/10 hover:bg-white/20 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">AR Mode</h1>
        {/* Placeholder for potential settings/flash toggle */}
        <div className="w-10"></div>
      </header>

      {/* Camera View */} 
      <div className="flex-1 relative bg-black"> {/* Ensure container has a background */} 
        {error ? (
          <div className="text-center p-4 bg-red-900/50 rounded-lg max-w-sm mx-auto z-10">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-200 font-medium mb-1">Error</p> {/* Simplified title */} 
            <p className="text-red-300 text-sm">{error}</p>
            {/* Conditionally show Try Again button only for camera errors */}
            {error.includes("camera") && 
               <Button onClick={setupCamera} size="sm" variant="destructive" className="mt-3">Try Again</Button>
            }
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted 
            // Use absolute positioning to fill the container more reliably
            className={`absolute inset-0 w-full h-full object-cover ${stream ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`} 
          />
        )}
         {/* Loading overlay */} 
         {!stream && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        )}
        {/* Status Overlay */} 
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              key="status-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 top-16 flex justify-center z-30"
            >
              <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center space-x-2">
                {/* Update icon based on isMicListening */} 
                {isMicListening && <Mic className="h-4 w-4 text-red-500 animate-pulse" />} 
                {isTranscribing && <Loader2 className="h-4 w-4 animate-spin" />} 
                {isAnalyzing && !isSpeaking && <Loader2 className="h-4 w-4 animate-spin" />} 
                {isSpeaking && <Volume2 className="h-4 w-4 text-green-400 animate-pulse" />}
                <span>{statusMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>

      {/* AI Response Overlay */} 
      <AnimatePresence>
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-4 right-4 md:left-auto md:right-8 md:max-w-sm p-4 bg-black/70 backdrop-blur-md rounded-lg border border-gray-700 shadow-xl z-20"
          >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-semibold text-purple-300">NbAIl Says:</h3>
                <button onClick={() => setAiResponse(null)} className="text-gray-400 hover:text-white -mt-1 -mr-1">
                    <X className="h-4 w-4" />
                </button>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">{aiResponse}</p>
             {/* Optional: Add TTS button here */}
             {/* <Button size="sm" variant="ghost" className="mt-2 text-purple-300"><Volume2 className="h-4 w-4 mr-1"/> Speak</Button> */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */} 
      <footer className="absolute bottom-0 left-0 right-0 flex items-center justify-center p-6 space-x-6 z-20 bg-gradient-to-t from-black/50 to-transparent">
         {/* Camera Toggle Button */}
         <Button
           size="lg"
           onClick={() => {
             setIsFrontCamera(!isFrontCamera);
             setupCamera();
           }}
           disabled={!stream || isAnalyzing || isMicListening || isTranscribing || isSpeaking || !!error}
           className="group rounded-full w-12 h-12 p-0 bg-white/20 hover:bg-white/30 border border-white/30 text-white disabled:opacity-50 transition-all duration-200 relative shadow-lg hover:shadow-purple-500/30 hover:border-purple-400"
           aria-label="Toggle Camera"
         >
           <RefreshCw className="h-5 w-5" />
         </Button>

         {/* Camera Button */} 
         <Button
           size="lg"
           onClick={handleAnalyzeImage}
           // Update disabled state based on isMicListening
           disabled={!stream || isAnalyzing || isMicListening || isTranscribing || isSpeaking || !!error}
           className="group rounded-full w-16 h-16 p-0 bg-white/20 hover:bg-white/30 border border-white/30 text-white disabled:opacity-50 transition-all duration-200 relative shadow-lg hover:shadow-purple-500/30 hover:border-purple-400"
           aria-label="Analyze Image"
         >
           {isAnalyzing && !isMicListening && !isTranscribing && !isSpeaking ? (
             <Loader2 className="h-6 w-6 animate-spin" />
           ) : (
             <>
               <Camera className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
               {/* Adjust pulse condition */}
               <span className={`absolute inset-0 rounded-full border-2 ${!isAnalyzing && !isMicListening ? 'border-white/50 group-hover:border-purple-400 animate-pulse' : 'border-transparent'}`}></span>
             </>
           )}
         </Button>

         {/* Voice Input Toggle Button */} 
         <Button
           size="lg"
           onClick={handleMicToggle} // Use the toggle handler
           // Disable only when analyzing/transcribing/speaking or error/no stream
           disabled={!stream || isAnalyzing || isTranscribing || isSpeaking || !!error}
           // Change style based on isMicListening
           className={`group rounded-full w-16 h-16 p-0 border transition-all duration-200 relative shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 ${ 
             isMicListening 
               ? 'bg-red-600/50 border-red-500/70 text-white animate-pulse' 
               : 'bg-purple-600/30 hover:bg-purple-600/50 border-purple-500/50 text-purple-300 hover:text-white'
           }`}
           aria-label={isMicListening ? "Stop Listening" : "Start Listening"}
         >
           {isTranscribing ? (
             <Loader2 className="h-6 w-6 animate-spin" />
           ) : (
             <Mic className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
           )}
           {/* Pulsing effect when idle and enabled */}
           {!isAnalyzing && !isMicListening && !isTranscribing && !isSpeaking && !error && stream && (
               <span className="absolute inset-0 rounded-full border-2 border-purple-500/80 animate-pulse group-hover:border-white/50"></span>
           )}
         </Button>

      </footer>
    </div>
  )
}
