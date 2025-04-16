"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, X, Mic, Send, Loader2, Sparkles } from 'lucide-react';
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

  // Request camera access
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const getCameraStream = async () => {
      setError(null);
      setIsLoading(true);
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment", // Prefer rear camera
            width: { ideal: 1280 }, // Request a reasonable resolution
            height: { ideal: 720 } 
          },
          audio: false // No audio needed for basic frame capture
        });
        setStream(currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (err instanceof Error) {
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
             setError("Camera permission denied. Please enable camera access in your browser settings.");
          } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
             setError("No camera found. Please ensure a camera is connected and enabled.");
          } else {
             setError(`Failed to access camera: ${err.message}`);
          }
        } else {
           setError("An unknown error occurred while accessing the camera.");
        }
        setStream(null);
      } finally {
        setIsLoading(false);
      }
    };

    getCameraStream();

    // Cleanup function to stop the stream when the component unmounts
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        console.log("Camera stream stopped.");
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

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

    const prompt = query || "Describe what you see in this image."; // Default prompt

    try {
      console.log("Sending image to Groq Vision...");
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
                <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg max-w-lg mx-auto text-center mb-4 pointer-events-auto">
                    <p>{lastResponse}</p>
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
