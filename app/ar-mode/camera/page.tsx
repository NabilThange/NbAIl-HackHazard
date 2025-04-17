"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, X, Mic, Send, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGroqVisionCompletion } from '@/lib/groq-service'; // Assuming this can be reused

export default function ARModePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [lastImageBase64, setLastImageBase64] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState<string>(""); // For potential text input alongside image
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment'); // State for camera facing mode

  // Store stream in ref to manage cleanup correctly across re-renders/flips
  const streamRef = useRef<MediaStream | null>(null);

  // Function to get camera stream based on facing mode
  const getCameraStream = async (mode: 'environment' | 'user') => {
    setError(null);
    setIsLoading(true);
    // Stop previous stream if it exists
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        console.log("Previous stream stopped.");
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode, // Use the requested mode
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = newStream; // Store in ref
      setStream(newStream); // Update state to trigger UI changes
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        // Attempt to play the video after setting the source
        videoRef.current.play().catch(err => console.error("Video play failed:", err));
      }
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error(`Error accessing ${mode} camera:`, err);
      streamRef.current = null; // Clear ref on error
      setStream(null); // Clear state on error
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
           setError("Camera permission denied. Please enable camera access in your browser settings.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
           setError(`No ${mode === 'user' ? 'front' : 'rear'} camera found.`);
        } else if (err.name === "OverconstrainedError") {
           setError(`Camera does not support requested constraints (mode: ${mode}). Trying other camera.`);
           // Optionally try the other facing mode automatically here
           const otherMode = mode === 'environment' ? 'user' : 'environment';
           setFacingMode(otherMode); // Update state immediately
           // We rely on useEffect to retry with the new facingMode
        } else {
           setError(`Failed to access camera: ${err.message}`);
        }
      } else {
         setError("An unknown error occurred while accessing the camera.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  // Request initial camera access on mount and when facingMode changes
  useEffect(() => {
    getCameraStream(facingMode);

    // Cleanup function to stop the stream when the component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        console.log("Camera stream stopped on unmount.");
        streamRef.current = null;
      }
    };
    // Depend on facingMode to re-run when it changes
  }, [facingMode]);

  const handleClose = () => {
    router.back(); // Go back to the previous page (likely chat)
  };

  // Capture frame and send to AI
  const handleCapture = async (query?: string) => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Video or canvas element not available.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the canvas
    const context = canvas.getContext('2d');
    if (!context) {
        setError("Could not get canvas context.");
        return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data as base64
    // Use jpeg for smaller size, adjust quality as needed
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);
    setLastImageBase64(imageBase64); // Store for potential display or retry
    setLastResponse(null); // Clear previous response
    setIsAnalyzing(true);
    setError(null);

    // Use the new, more descriptive prompt for blind assistance
    const prompt = query || "You are an AI that helps blind people by describing what you see in an image.\nSpeak clearly and simply. Write your answer in first person, like you're talking to the user.\n\nStart by saying \u201CI see...\u201D\n\nDescribe the most important things in the image. For example: people, objects, actions, places.\n\nIf there is text in the image (like signs, books, screens), read it out loud in your answer.\n\nSpeak like a helpful friend. Use short sentences.\n\nOnly say what is clearly visible. Do not guess or imagine things."; 

    try {
      console.log("Sending image to Groq Vision with new prompt...");
      const response = await getGroqVisionCompletion(prompt, imageBase64, 'image/jpeg');
      console.log("Groq Vision Response:", response);
      setLastResponse(response || "I received the image, but couldn't generate a description.");
      
      // Optional: Speak the response
      // speakText(response);
      
    } catch (err) {
      console.error("Error analyzing image:", err);
      let errorMsg = "An unknown error occurred during analysis.";
      if (err instanceof Error) {
         errorMsg = `Failed to analyze image: ${err.message}`;
      }
      setError(errorMsg);
      setLastResponse(null);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Function to flip the camera
  const handleFlipCamera = () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode); // This will trigger the useEffect to get the new stream
  };

  // Placeholder for voice input logic
  const handleVoiceInput = () => {
      console.log("Voice input triggered");
      // We can adapt the logic from the chat page later if needed
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30">
           <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
           <p className="text-lg">Starting Camera...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 z-30 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Camera Error</h2>
          <p className="text-lg mb-6">{error}</p>
          <Button onClick={handleClose} variant="destructive" size="lg">
            Go Back
          </Button>
        </div>
      )}
      
      {/* Camera View & Controls (only if stream is active) */}
      {stream && !isLoading && !error && (
        <>
          {/* Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted // Mute the video element itself
            className="absolute top-0 left-0 w-full h-full object-cover z-0" // Cover the entire container
          />
          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} /> 

          {/* Overlay UI */}
          <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 md:p-6 pointer-events-none"> {/* pointer-events-none for container, enable for children */}
            {/* Top Bar */}
            <div className="flex justify-end pointer-events-auto">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={handleClose}
                aria-label="Close AR Mode"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Response Area (Placeholder) */}
            {lastResponse && (
                // Apply terminal-like styling
                <div className="bg-[#24233b]/90 border border-gray-700 shadow-lg rounded-lg max-w-lg mx-auto mb-4 pointer-events-auto font-mono text-left overflow-hidden">
                    {/* Optional: Add a title bar like the example */}
                    <div className="bg-gray-800/50 px-4 py-2 flex items-center space-x-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span className="text-xs text-gray-400 flex-1 text-center">AI Response</span>
                    </div>
                    {/* Response text content */}
                    <p className="p-4 text-gray-200 text-sm whitespace-pre-wrap break-words">
                        {lastResponse}
                    </p>
                </div>
            )}

            {/* Bottom Bar */}
            <div className="flex justify-center items-center space-x-4 pointer-events-auto">
               {/* Text Input (Optional for query with image) - Can be hidden/shown */}
               {/* <Input 
                  type="text" 
                  value={userQuery} 
                  onChange={(e) => setUserQuery(e.target.value)} 
                  placeholder="Ask about the image..."
                  className="bg-black/50 border-gray-700 text-white rounded-full"
               /> */}

              {/* Flip Camera Button */}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-black/50 hover:bg-black/70 text-white w-14 h-14"
                onClick={handleFlipCamera}
                aria-label="Flip Camera"
                disabled={isLoading || isAnalyzing} // Disable while loading or analyzing
              >
                <RefreshCw className="h-6 w-6" />
              </Button>

              {/* Capture Button */}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-black/50 hover:bg-black/70 text-white w-16 h-16 border-2 border-white"
                onClick={() => handleCapture()}
                aria-label="Capture Image"
                disabled={isAnalyzing}
              >
                 {isAnalyzing ? <Loader2 className="h-7 w-7 animate-spin" /> : <Camera className="h-7 w-7" />}
              </Button>
              {/* Optional Voice Button */}
               {/* <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-black/50 hover:bg-black/70 text-white w-14 h-14"
                onClick={handleVoiceInput}
                aria-label="Ask with Voice"
                disabled={isAnalyzing}
              >
                <Mic className="h-6 w-6" />
              </Button> */}
            </div>
          </div>
          
          {/* Analysis Loading Overlay */}
          {isAnalyzing && (
             <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                <Sparkles className="h-12 w-12 text-purple-400 mb-4 animate-pulse" />
                <p className="text-xl font-medium">NbAIl is analyzing...</p>
                <p className="text-gray-400 mt-2">Please wait a moment.</p>
             </div>
          )}
        </>
      )}
    </div>
  );
}
