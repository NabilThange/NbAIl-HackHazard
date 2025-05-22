"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera, Mic, Loader2, AlertTriangle, Volume2, X, RefreshCw, CircleDot, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { useSwipeable } from 'react-swipeable'
import { getGroqVisionAnalysis, getGroqTranscription } from "@/lib/groq-service"
import { speakText } from "@/lib/tts-service"
import InfoWidget from '@/components/ar/InfoWidget'

// THESE IMPORTS ARE LIKELY NEEDED BASED ON LINTER ERRORS - ADDING THEM HERE
import * as faceapi from 'face-api.js';
import { FilesetResolver, ObjectDetector, GestureRecognizer, GestureRecognizerResult } from "@mediapipe/tasks-vision";


// Placeholder for DETAILED_BASE_PROMPT if not defined elsewhere
const DETAILED_BASE_PROMPT = "You are a compassionate and intuitive vision assistant AI, designed to help individuals understand their surroundings through detailed descriptions. Your task is to guide me, as I am visually impaired, in perceiving the environment around me by providing insights about people, locations, objects, and more. \n\nPlease describe the scene around me, focusing on the following elements:  \n\nPeople: __________  \nLocation: __________  \nObjects: __________  \nActivities: __________\n\n\nOutput Format:Begin your response with the phrase \"I see...\" followed by a vivid description of the surroundings. Use bold text to emphasize important details or actions. \n\nDetails:  \n\nProvide sensory details that evoke a sense of the environment, including sounds, smells, temperatures, and textures.  \nBe empathetic and supportive, as if you are my companion, ensuring that your tone is warm and encouraging.  \nConsider the context of the location and the activities happening around me.\n\n\nExamples:  \n\n\"I see a group of people laughing and talking near a vibrant café, the aroma of freshly brewed coffee fills the air.\"  \n\"I see a park with children playing; the sound of laughter mixes with the rustling of leaves in the gentle breeze.\"\n\n\nConstraints:  \n\nAvoid using overly technical language; keep the descriptions clear and relatable.  \nEnsure that the descriptions are not overwhelming; focus on providing a balanced overview of the surroundings.  \nDo not assume prior knowledge; provide context where necessary for clarity.";


export default function ARModeContent() { // Renamed from ARModePage
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
  
  // State variables that were causing "Cannot find name" errors
  const [modelsReady, setModelsReady] = useState(false);
  const [mediaPipeModelsReady, setMediaPipeModelsReady] = useState(false);
  const [faceApiError, setFaceApiError] = useState<string | null>(null);
  const [mediaPipeError, setMediaPipeError] = useState<string | null>(null);
  const [objectDetector, setObjectDetectorState] = useState<ObjectDetector | null>(null); // Corrected state name
  const [gestureRecognizer, setGestureRecognizerState] = useState<GestureRecognizer | null>(null); // Corrected state name
  const lastVideoTimeRef = useRef<number>(0);
  const [identityInfoContent, setIdentityInfoContent] = useState<string | null>(null);
  const [objectCardContent, setObjectCardContent] = useState<string | null>(null);
  const [capturedImagePreviewUrl, setCapturedImagePreviewUrl] = useState<string | null>(null);
  const [showCards, setShowCards] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);


  // Face-API model loading options
  const getTinyFaceDetectorOptions = useCallback(() => {
    return new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
  }, []);
  
  // Function to load FaceAPI models
  const loadModels = useCallback(async () => {
    const MODEL_URL = '/models/faceapi'; // Ensure this path is correct
    try {
      console.log("Loading Face-API models...");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
      ]);
      setModelsReady(true);
      console.log("Face-API models loaded successfully.");
      setFaceApiError(null);
    } catch (err) {
      console.error("Error loading Face-API models:", err);
      const message = err instanceof Error ? err.message : "Unknown error loading face models";
      setFaceApiError(`Failed to load face models: ${message}. Ensure model files are accessible at ${MODEL_URL}.`);
      setModelsReady(false);
    }
  }, [setModelsReady, setFaceApiError]);

  const areModelsLoaded = useCallback(() => { // Basic check, relies on modelsReady state
    return modelsReady;
  }, [modelsReady]);

  // Load FaceAPI models on mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Load MediaPipe Models on mount
  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        console.log("Initializing MediaPipe Vision Tasks...");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        // Object Detector
        const newObjectDetector = await ObjectDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: `/mediapipe-models/efficientdet_lite0.tflite`, delegate: "GPU" },
          scoreThreshold: 0.5,
          runningMode: "VIDEO",
        });
        setObjectDetectorState(newObjectDetector);
        console.log("MediaPipe Object Detector created.");

        // Gesture Recognizer
        const newGestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: { modelAssetPath: `/mediapipe-models/gesture_recognizer.task`, delegate: "GPU" },
          runningMode: "VIDEO",
          numHands: 2,
        });
        setGestureRecognizerState(newGestureRecognizer);
        console.log("MediaPipe Gesture Recognizer created.");

        setMediaPipeModelsReady(true);
        setMediaPipeError(null);
        console.log("MediaPipe models initialized successfully.");
      } catch (err) {
        console.error("Error initializing MediaPipe models:", err);
        const message = err instanceof Error ? err.message : "Unknown error loading MediaPipe models";
        setMediaPipeError(`Failed to load MediaPipe models: ${message}.`);
        setMediaPipeModelsReady(false);
      }
    };
    initializeMediaPipe();
  }, [setMediaPipeModelsReady, setMediaPipeError, setObjectDetectorState, setGestureRecognizerState]);


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
    setupCamera();
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
  }, [setupCamera]);

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

  // Helper function for Face-API.js analysis - now for one-time analysis on a given media element
  const performFaceApiAnalysis = useCallback(async (mediaElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | null) => {
    if (!modelsReady || !mediaElement) {
      console.warn("Face-API models not ready or media element not available for analysis.");
      setIdentityInfoContent(prev => prev === null ? `**Identity:**\n- Models not ready` : prev); 
      return null;
    }
    
    // Check if it's a video element and if it's ready
    if (mediaElement instanceof HTMLVideoElement && (mediaElement.readyState < mediaElement.HAVE_METADATA || mediaElement.paused || mediaElement.ended)) {
      console.warn("Video element not ready, paused, or ended for Face-API analysis.");
      setIdentityInfoContent(prev => prev === null ? `**Identity:**\n- Video not ready` : prev);
      return null;
    }

    setFaceApiError(null); 

    try {
      console.log("Performing face-api.js detection...");
      const detections = await faceapi
        .detectAllFaces(mediaElement, getTinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      if (detections && detections.length > 0) {
        const firstDetection = detections[0];
        const { age, gender, expressions } = firstDetection;
        
        let dominantExpression = "neutral";
        let maxProbability = 0;

        if (expressions && typeof expressions === 'object') {
          for (const expressionKey in expressions) {
            if (Object.prototype.hasOwnProperty.call(expressions, expressionKey)) {
              const probability = (expressions as any)[expressionKey];
              if (typeof probability === 'number' && probability > maxProbability) {
                maxProbability = probability;
                dominantExpression = expressionKey;
              }
            }
          }
        }

        const identityText = `🎂 Age: ~${Math.round(age)} years\n👤 Gender: ${gender.charAt(0).toUpperCase() + gender.slice(1)}\n😀 Mood: ${dominantExpression.charAt(0).toUpperCase() + dominantExpression.slice(1)}`;
        setIdentityInfoContent(identityText);
        console.log("One-time Face-API Analysis Result:", { age: Math.round(age), gender, mood: dominantExpression });
        return { age: Math.round(age), gender, mood: dominantExpression }; 
      } else {
        // Simplified message for no face detection
        const blurryMessage = "No Clear Face Detected Check the Lighting";
        setIdentityInfoContent(blurryMessage);
        console.log("No human faces detected by Face-API in the captured image.");
        return null;
      }
    } catch (err) {
      console.error("Error during one-time face-api.js detection:", err);
      const errorMessage = err instanceof Error ? err.message : "Face detection failed on captured image";
      
      // Specific error handling message
      const errorText = `**Detection Error:**\n🤔 ${errorMessage}\n🤔 Try adjusting camera\n🤔 Ensure good lighting`;
      
      setFaceApiError(errorMessage);
      setIdentityInfoContent(errorText);
      return null;
    }
  }, [modelsReady, getTinyFaceDetectorOptions, setIdentityInfoContent, setFaceApiError]);

  // --- New function for MediaPipe Analysis ---
  const performMediaPipeAnalysis = useCallback(async (videoElement: HTMLVideoElement | null): Promise<{ objectsText: string | null; gesturesText: string | null }> => {
    if (!mediaPipeModelsReady || !objectDetector || !gestureRecognizer || !videoElement) {
      console.warn("MediaPipe models not ready or video element not available for analysis.");
      return { objectsText: `**Objects/Gestures:**\n- MediaPipe not ready`, gesturesText: null };
    }

    if (videoElement.readyState < videoElement.HAVE_METADATA || videoElement.paused || videoElement.ended) {
      console.warn("Video element not ready, paused, or ended for MediaPipe analysis.");
      return { objectsText: `**Objects/Gestures:**\n- Video not ready`, gesturesText: null };
    }
    
    lastVideoTimeRef.current = videoElement.currentTime;


    let objectsText: string | null = null;
    let gesturesText: string | null = null;

    try {
      // Object Detection
      const objectDetections = objectDetector.detectForVideo(videoElement, performance.now());
      if (objectDetections && objectDetections.detections.length > 0) {
        const detectedObjectNames = objectDetections.detections
          .map(det => det.categories[0]?.categoryName || "Unknown Object")
          .filter((name, index, self) => self.indexOf(name) === index); // Unique names

        if (detectedObjectNames.length > 0) {
          objectsText = `**Detected Objects:**\n${detectedObjectNames.map(name => `📦 ${name}`).join('\n')}`;
        } else {
          objectsText = "**Detected Objects:**\n- None clearly identified";
        }
        console.log("MediaPipe Object Detection Result:", detectedObjectNames);
      } else {
        objectsText = "**Detected Objects:**\n- None";
        console.log("No objects detected by MediaPipe.");
      }

      // Gesture Recognition
      const gestureRecognitionResult: GestureRecognizerResult = gestureRecognizer.recognizeForVideo(videoElement, performance.now());
      if (gestureRecognitionResult.gestures.length > 0) {
        const gestureMap: { [key: string]: string } = {
          "None": "None",
          "Closed_Fist": "Closed Fist ✊",
          "Open_Palm": "Open Palm 🖐️",
          "Pointing_Up": "Pointing Up ☝️",
          "Thumb_Down": "Thumbs Down 👎",
          "Thumb_Up": "Thumbs Up 👍",
          "Victory": "Victory ✌️",
          "ILoveYou": "I Love You 🤟",
          "Unknown": "Unknown Gesture ❔"
        };

        const recognizedGestures = gestureRecognitionResult.gestures
          .map(gestureData => {
            const categoryName = gestureData[0]?.categoryName || "Unknown";
            return gestureMap[categoryName] || `${categoryName} (Unknown)`; // Fallback for unmapped gestures
          })
          .filter((name, index, self) => self.indexOf(name) === index && name !== "None"); // Unique and not "None"

        if (recognizedGestures.length > 0) {
          gesturesText = `**Detected Gestures:**\n${recognizedGestures.map(gesture => `🤚 ${gesture}`).join('\n')}`;
        } else {
          gesturesText = "**Detected Gestures:**\n- None clearly identified";
        }
        console.log("MediaPipe Gesture Recognition Result:", recognizedGestures);
      } else {
        gesturesText = "**Detected Gestures:**\n- None";
        console.log("No gestures detected by MediaPipe.");
      }
      
    } catch (err) {
      console.error("Error during MediaPipe analysis:", err);
      const mediaPipeErrorMessage = err instanceof Error ? err.message : "MediaPipe analysis failed";
      setMediaPipeError(mediaPipeErrorMessage); // Set specific MediaPipe error
      // Optionally, update objectsText/gesturesText to show error
      objectsText = `**Object Detection Error:**\n- ${mediaPipeErrorMessage}`;
      gesturesText = `**Gesture Recognition Error:**\n- ${mediaPipeErrorMessage}`;
    }

    return { objectsText, gesturesText };
  }, [mediaPipeModelsReady, objectDetector, gestureRecognizer, setMediaPipeError, lastVideoTimeRef]);

  // Format recording time as MM:SS
  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Capture and analyze a single frame
  const captureAndAnalyzeFrame = useCallback(async () => {
    console.log("[captureAndAnalyzeFrame] Starting frame analysis (called from interval or initial trigger).");
    
    const imageDataUrl = captureFrame();
    if (!imageDataUrl) {
      console.error("[captureAndAnalyzeFrame] Could not capture frame.");
      return;
    }
    
    setCapturedImagePreviewUrl(imageDataUrl);
    console.log("[captureAndAnalyzeFrame] Captured image preview URL set.");
    
    try {
      await performFaceApiAnalysis(videoRef.current);
      console.log("[captureAndAnalyzeFrame] Face analysis complete.");
    } catch (err) {
      console.error("[captureAndAnalyzeFrame] Face analysis error:", err);
    }
    
    try {
      const { objectsText, gesturesText } = await performMediaPipeAnalysis(videoRef.current);
      let combinedObjectGestureContent = "";
      if (objectsText) combinedObjectGestureContent += objectsText;
      if (gesturesText) {
        if (combinedObjectGestureContent) combinedObjectGestureContent += "\n\n";
        combinedObjectGestureContent += gesturesText;
      }
      if (!combinedObjectGestureContent) {
        combinedObjectGestureContent = "**Objects & Gestures:**\n- None detected or analysis issue.";
      }
      setObjectCardContent(combinedObjectGestureContent);
      console.log("[captureAndAnalyzeFrame] MediaPipe analysis complete. Content:", combinedObjectGestureContent);
    } catch (err) {
      console.error("[captureAndAnalyzeFrame] MediaPipe analysis error:", err);
    }
    
    try {
      const response = await getGroqVisionAnalysis(imageDataUrl, DETAILED_BASE_PROMPT);
      setAiResponse(response);
      console.log("[captureAndAnalyzeFrame] Groq vision analysis complete. Response:", response);
    } catch (err) {
      console.error("[captureAndAnalyzeFrame] Groq vision analysis error:", err);
    }
    
    setShowCards(true);
    setLastAnalysisTime(Date.now());
    console.log("[captureAndAnalyzeFrame] setShowCards(true) called. lastAnalysisTime set.");
  }, [
    captureFrame, 
    DETAILED_BASE_PROMPT, 
    performFaceApiAnalysis, 
    performMediaPipeAnalysis, 
    getGroqVisionAnalysis, 
    setCapturedImagePreviewUrl, 
    setIdentityInfoContent, 
    setObjectCardContent, 
    setAiResponse, 
    setShowCards, 
    setLastAnalysisTime,
    videoRef // videoRef.current is used by analysis helpers
  ]);

  // Effect to handle recording logic (timer and periodic capture)
  useEffect(() => {
    let localRecordingTimerId: NodeJS.Timeout | null = null;
    let localFrameAnalysisIntervalId: NodeJS.Timeout | null = null;

    if (isRecording) {
      console.log("[Recording Effect] Recording started. Performing initial capture.");
      setStatusMessage("Smart recording initializing...");
      
      captureAndAnalyzeFrame().then(() => {
        setStatusMessage("Smart recording..."); 
      });

      localRecordingTimerId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      recordingIntervalRef.current = localRecordingTimerId; 

      localFrameAnalysisIntervalId = setInterval(() => {
        console.log("[Recording Effect] Interval: Capturing and analyzing frame.");
        captureAndAnalyzeFrame();
      }, 4000);
      captureIntervalRef.current = localFrameAnalysisIntervalId;
      
      setRecordStartTime(Date.now());

    } else {
      console.log("[Recording Effect] Recording stopped.");
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      setRecordingTime(0);
      setRecordStartTime(null);
      if (statusMessage === "Smart recording..." || statusMessage === "Smart recording initializing...") {
        setStatusMessage(null);
      }
    }

    return () => {
      console.log("[Recording Effect] Cleanup: Clearing intervals from effect.");
      if (localRecordingTimerId) clearInterval(localRecordingTimerId);
      if (localFrameAnalysisIntervalId) clearInterval(localFrameAnalysisIntervalId);
      
      if (recordingIntervalRef.current === localRecordingTimerId) recordingIntervalRef.current = null;
      if (captureIntervalRef.current === localFrameAnalysisIntervalId) captureIntervalRef.current = null;
    };
  }, [isRecording, captureAndAnalyzeFrame, setStatusMessage, setRecordingTime, setRecordStartTime]);

  // Handle Record Toggle
  const handleRecordToggle = useCallback(() => {
    if (!modelsReady || !mediaPipeModelsReady) {
      setError("AI models are not ready yet. Please wait or refresh.");
      return;
    }

    setIsRecording(prevIsRecording => {
      const newIsRecording = !prevIsRecording;
      if (newIsRecording) {
        console.log("[handleRecordToggle] Starting recording process...");
        setCapturedImagePreviewUrl(null);
        setObjectCardContent(null);
        setIdentityInfoContent(null);
        setAiResponse(null);
        setShowCards(false); 
        setLastAnalysisTime(null);
      } else {
        console.log("[handleRecordToggle] Stopping recording process...");
      }
      return newIsRecording;
    });
  }, [modelsReady, mediaPipeModelsReady, setIsRecording, setCapturedImagePreviewUrl, setObjectCardContent, setIdentityInfoContent, setAiResponse, setShowCards, setLastAnalysisTime, setError]);

  // Handle Analyze Image (one-time capture)
  const handleAnalyzeImage = useCallback(async () => {
    setStatusMessage("Capturing image...")
    setIsAnalyzing(true)
    setAiResponse(null)
    setError(null)
    // Ensure all cards are hidden initially for new analysis
    setCapturedImagePreviewUrl(null);
    setObjectCardContent(null);
    setIdentityInfoContent(null);
    setShowCards(false);
    setFaceApiError(null);
    setMediaPipeError(null);

    const imageDataUrl = captureFrame()

    if (!imageDataUrl) {
      setIsAnalyzing(false)
      setStatusMessage(null)
      setError("Could not capture frame for analysis.")
      return
    }
    setCapturedImagePreviewUrl(imageDataUrl); // Show captured image immediately


    setStatusMessage("Analyzing image...")
    console.log("Frame captured, sending for analysis...")

    // Perform all analyses
    let faceAnalysisResult = null;
    try {
      faceAnalysisResult = await performFaceApiAnalysis(videoRef.current);
    } catch (err) {
      console.error("Error in performFaceApiAnalysis for handleAnalyzeImage:", err);
    }

    let mediaPipeAnalysisResult: { objectsText: string | null; gesturesText: string | null } = { objectsText: null, gesturesText: null };
    try {
      mediaPipeAnalysisResult = await performMediaPipeAnalysis(videoRef.current);
      let combinedObjectGestureContent = "";
      if (mediaPipeAnalysisResult.objectsText) combinedObjectGestureContent += mediaPipeAnalysisResult.objectsText;
      if (mediaPipeAnalysisResult.gesturesText) {
        if (combinedObjectGestureContent) combinedObjectGestureContent += "\n\n";
        combinedObjectGestureContent += mediaPipeAnalysisResult.gesturesText;
      }
      setObjectCardContent(combinedObjectGestureContent || "**Objects & Gestures:**\n- None detected.");
    } catch (err) {
      console.error("Error in performMediaPipeAnalysis for handleAnalyzeImage:", err);
      setObjectCardContent("**Objects & Gestures:**\n- Analysis failed.");
    }
    
    try {
      // Using DETAILED_BASE_PROMPT for manual analysis as well
      const response = await getGroqVisionAnalysis(imageDataUrl, DETAILED_BASE_PROMPT)
      setAiResponse(response)
    } catch (err) {
      console.error("Error analyzing image with Groq (handleAnalyzeImage):", err);
      const groqErrorMessage = err instanceof Error ? err.message : "An unknown error occurred during Groq analysis.";
      setError(`Groq analysis failed: ${groqErrorMessage}`);
      setAiResponse("Scene analysis failed."); // Show error in AI response card
    }
    
    setShowCards(true); // Show all cards after analyses are attempted
    setIsAnalyzing(false);
    setStatusMessage(null); 
  }, [modelsReady, mediaPipeModelsReady, captureFrame, DETAILED_BASE_PROMPT, performFaceApiAnalysis, performMediaPipeAnalysis, getGroqVisionAnalysis, setAiResponse, setCapturedImagePreviewUrl, setObjectCardContent, setIdentityInfoContent, setError, setFaceApiError, setMediaPipeError, setShowCards, setStatusMessage, videoRef]);


  // --- Flip Camera ---
  const handleFlipCamera = () => {
    console.log("Flipping camera...")
    setIsFrontCamera((prev) => !prev)
    // State update will trigger useEffect to call setupCamera
  }

  // --- Microphone Toggle Logic ---
  const handleMicToggle = () => {
    if (!modelsReady || !mediaPipeModelsReady) { // Check both
       setError("AI models are not ready yet. Please wait or refresh.");
       return;
    }
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
      // 1. Get Audio Stream
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // 2. Create MediaRecorder (Let browser choose default MIME type)
      let recorder;
      try {
          recorder = new MediaRecorder(audioStream);
      } catch (e1) {
          console.error("MediaRecorder creation failed:", e1);
          alert("Could not create audio recorder. Your browser might not support it.");
          audioStream.getTracks().forEach(track => track.stop());
          return;
      }
      mediaRecorderRef.current = recorder;
      console.log("Using MediaRecorder with MIME type:", mediaRecorderRef.current.mimeType);

      // 3. Clear previous chunks
      audioChunksRef.current = []
      setIsMicListening(true) // Set listening state
      setIsSpeaking(false)
      setIsTranscribing(false)

      // 4. Handle Data Available
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // 5. Handle Recording Stop
      mediaRecorderRef.current.onstop = async () => {
        console.log("Mic listener stopped manually.")
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const blobSize = audioBlob.size;
        console.log(`Audio Blob Size: ${blobSize} bytes, Type: ${mimeType}`);
        
        // Stop tracks *immediately* after creating blob
        audioStream.getTracks().forEach(track => track.stop());

        // Reset listening state *before* processing
        setIsMicListening(false)

        if (blobSize === 0) {
          console.warn("Empty audio recorded.")
          setStatusMessage(null)
          setError("Couldn't hear anything. Please try speaking again.")
          return
        }
        
        setStatusMessage("Transcribing...")
        setIsTranscribing(true)
        
        const recordedChunks = [...audioChunksRef.current] // Not strictly needed now, but keeping pattern
        audioChunksRef.current = [] // Clear chunks immediately

        try {
          const fileName = mimeType.includes('opus') ? "recording.opus" : "recording.webm";
          const audioFile = new File([audioBlob], fileName, { type: mimeType })
          const transcription = await getGroqTranscription(audioFile)
          console.log("Raw Transcription Result:", transcription);
          setIsTranscribing(false)

          // Improved check for invalid transcription
          if (!transcription || transcription.toLowerCase().startsWith("sorry") || transcription.trim() === "" || transcription.trim().toLowerCase() === "you") {
            setError("Could not understand audio or transcription was invalid. Please try again.");
            console.warn("Invalid transcription received:", transcription);
            setStatusMessage(null);
            return;
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

      // 6. Start Recording
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
    // Ensure all cards are hidden initially for new analysis
    setCapturedImagePreviewUrl(null);
    setObjectCardContent(null);
    setIdentityInfoContent(null);
    setShowCards(false);
    setFaceApiError(null);
    setMediaPipeError(null);

    const imageDataUrl = captureFrame()

    if (!imageDataUrl) {
      setIsAnalyzing(false)
      setStatusMessage(null)
      setError("Could not capture frame for analysis.")
      return
    }
    setCapturedImagePreviewUrl(imageDataUrl); // Show captured image immediately


    setStatusMessage("Analyzing image with your query...")
    console.log(`Frame captured, analyzing with query: "${transcribedQuery}"`)

    // Perform all analyses for voice query as well
    let faceAnalysisResult = null;
    try {
      faceAnalysisResult = await performFaceApiAnalysis(videoRef.current);
    } catch (err) {
      console.error("Error in performFaceApiAnalysis for handleAnalyzeVoice:", err);
    }

    let mediaPipeAnalysisResult: { objectsText: string | null; gesturesText: string | null } = { objectsText: null, gesturesText: null };
    try {
      mediaPipeAnalysisResult = await performMediaPipeAnalysis(videoRef.current);
      let combinedObjectGestureContent = "";
      if (mediaPipeAnalysisResult.objectsText) combinedObjectGestureContent += mediaPipeAnalysisResult.objectsText;
      if (mediaPipeAnalysisResult.gesturesText) {
        if (combinedObjectGestureContent) combinedObjectGestureContent += "\n\n";
        combinedObjectGestureContent += mediaPipeAnalysisResult.gesturesText;
      }
      setObjectCardContent(combinedObjectGestureContent || "**Objects & Gestures:**\n- None detected.");
    } catch (err) {
      console.error("Error in performMediaPipeAnalysis for handleAnalyzeVoice:", err);
      setObjectCardContent("**Objects & Gestures:**\n- Analysis failed.");
    }
    
    // Define the base accessibility prompt (same as in handleAnalyzeImage)
    const basePrompt = "You are an AI that helps blind people by describing what you see in an image.\nSpeak clearly and simply. Write your answer in first person, like you're talking to the user.\n\nStart by saying \u201CI see...\u201D\n\nDescribe the most important things in the image. For example: people, objects, actions, places.\n\nIf there is text in the image (like signs, books, screens), read it out loud in your answer.\n\nSpeak like a helpful friend. Use short sentences.\n\nOnly say what is clearly visible. Do not guess or imagine things.";

    // Combine the base prompt with the user's query
    const finalPrompt = `${basePrompt}\n\nBased on that description style, the user specifically asked: "${transcribedQuery}"`
    console.log("Combined Vision Prompt:", finalPrompt); // Log the combined prompt

    try {
      // Send the combined prompt to the vision analysis function
      const response = await getGroqVisionAnalysis(imageDataUrl, finalPrompt)
      setAiResponse(response)
      setStatusMessage("Speaking response...") 
      // Speak the response
      speakText(
         response,
         () => { console.log("TTS started"); setIsSpeaking(true); setStatusMessage("Speaking..."); },
         () => { 
           console.log("TTS ended"); 
           setIsSpeaking(false); 
           setStatusMessage(null); 
           // Auto-hide response and related cards after speaking
           setAiResponse(null); 
           setCapturedImagePreviewUrl(null);
           setObjectCardContent(null);
           setIdentityInfoContent(null);
           setShowCards(false); // Explicitly hide cards after TTS
         },
         (err) => { 
             console.error("TTS Error:", err);
             setError("Error speaking the response.");
             setIsSpeaking(false);
             setStatusMessage(null);
         }
       );

    } catch (err) {
      console.error("Error analyzing image with Groq (voice query):", err);
      const groqErrorMessage = err instanceof Error ? err.message : "An unknown error occurred during Groq analysis.";
      setError(`Groq analysis failed: ${groqErrorMessage}`);
      setStatusMessage(null);
    } finally {
      setIsAnalyzing(false); 
      setShowCards(true); // Show cards after all analysis attempts (might be empty if errors)
    }
  }, [captureFrame, modelsReady, mediaPipeModelsReady, DETAILED_BASE_PROMPT, performFaceApiAnalysis, performMediaPipeAnalysis, getGroqVisionAnalysis, speakText, videoRef, setCapturedImagePreviewUrl, setObjectCardContent, setIdentityInfoContent, setAiResponse, setError, setFaceApiError, setMediaPipeError, setShowCards, setStatusMessage, setIsAnalyzing, setIsSpeaking]);

  // Main prediction loop and drawing logic
  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    let animationFrameId: number | null = null;

    const predictWebcam = async () => {
      if (!videoElement || !canvasElement || !objectDetector || !gestureRecognizer || !modelsReady || !mediaPipeModelsReady || document.hidden) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        return;
      }

      // Ensure this block and its contents are not causing issues.
      // The face-api.js drawing part seems to be removed in latest versions, let's assume it's intentional.
      // If MediaPipe drawing is needed, it would be here.

      // Request next frame
      if (!document.hidden) { // Check if document is visible before requesting new frame
        animationFrameId = requestAnimationFrame(predictWebcam);
      }
    };
    
    // Start prediction loop if models are ready and video is available
    if (modelsReady && mediaPipeModelsReady && videoRef.current && videoRef.current.readyState >= 2) { // readyState 2 means HAVE_CURRENT_DATA
        predictWebcam();
    }


    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      // Clear canvas on component unmount or when dependencies change
      if (canvasElement) {
        const context = canvasElement.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvasElement.width, canvasElement.height);
        }
      }
    };
  }, [objectDetector, gestureRecognizer, modelsReady, mediaPipeModelsReady, videoRef, canvasRef, getTinyFaceDetectorOptions, areModelsLoaded, identityInfoContent, objectCardContent]);

  const handleAnalyze = useCallback(async (query?: string) => {
    // ... existing code ...
  }, []);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobileSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check on mount and add resize listener
    checkMobileSize();
    window.addEventListener('resize', checkMobileSize);
    
    return () => {
      window.removeEventListener('resize', checkMobileSize);
    };
  }, []);

  // Swipe handlers for mobile carousel
  const mobileCardHandlers = useSwipeable({
    onSwipedLeft: () => {
      // Move to next card, wrapping around if at end
      setActiveCardIndex((prev) => 
        prev < 2 ? prev + 1 : 0
      );
    },
    onSwipedRight: () => {
      // Move to previous card, wrapping around if at start
      setActiveCardIndex((prev) => 
        prev > 0 ? prev - 1 : 2
      );
    },
    preventScrollOnSwipe: true,
  });

  // Mobile card order and rendering
  const mobileCards = [
    {
      key: 'identity',
      content: (
        <div className="w-full max-w-sm mx-auto">
          {/* Existing Identity Card content */}
          {showCards && (capturedImagePreviewUrl || identityInfoContent) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-black/29 backdrop-blur-sm rounded-3xl border border-white/20 shadow-md w-full max-w-xs p-4 h-64 overflow-y-auto"
            >
              {/* Captured Image Preview */}
              {capturedImagePreviewUrl && (
                <div className="mb-4 rounded-2xl overflow-hidden shadow-md">
                  <img 
                    src={capturedImagePreviewUrl} 
                    alt="Captured Frame" 
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}

              {/* Identity Info */}
              {identityInfoContent && (
                <div className="flex flex-wrap gap-2">
                  {identityInfoContent.split('\n').map((trait, index) => {
                    const cleanTrait = trait.replace('- ', '');
                    let icon = '🤔';
                    if (cleanTrait.includes('Age')) icon = '🎂';
                    if (cleanTrait.includes('Gender')) icon = '👤';
                    if (cleanTrait.includes('Mood')) icon = '😀';

                    return (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs backdrop:blur-md"
                      >
                        {icon} {cleanTrait}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </div>
      )
    },
    {
      key: 'scene',
      content: (
        <div className="w-full max-w-sm mx-auto">
          {/* Existing Scene Analysis Card content */}
          {showCards && aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-black/29 backdrop-blur-sm rounded-3xl border border-white/20 shadow-md w-full max-w-sm p-4 h-82 overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-2 space-x-2">
                <h3 className="text-sm font-semibold text-white">Scene Analysis</h3>
                {!isRecording && (
                  <button
                    onClick={() => setAiResponse(null)}
                    className="text-gray-400 hover:text-white -mt-1 -mr-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="text-white text-sm leading-snug max-h-40 overflow-y-auto">
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </div>
      )
    },
    {
      key: 'objects',
      content: (
        <div className="w-full max-w-sm mx-auto">
          {/* Existing Objects & Gestures Card content */}
          {showCards && objectCardContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-black/29 backdrop-blur-sm rounded-3xl border border-white/20 shadow-md w-full max-w-xs p-4"
            >
              <h2 className="text-white text-sm font-semibold mb-2">Objects & Gestures</h2>
              {objectCardContent && (
                <>
                  <h3 className="text-xs text-gray-300 mb-1">Detected Objects</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {objectCardContent.includes("Detected Objects:") && 
                      objectCardContent.split("\n")
                        .filter(line => line.trim().startsWith("- "))
                        .map((item, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1 rounded-full bg-white/10 text-white text-xs"
                          >
                            {item.replace("- ", "")}
                          </span>
                        ))
                    }
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
      {/* Mobile Top Bar - Only show on mobile */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-sm flex justify-between items-center p-2">
          <Button 
            onClick={() => router.back()} 
            className="text-white bg-white/10 hover:bg-white/20 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <span>📍 Mumbai</span>
            <span>🕒 {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>🌤️ 32°C</span>
          </div>
        </div>
      )}

      {/* Existing camera view and other content */}
      <div className="flex-1 relative bg-black">
        {(error || faceApiError || mediaPipeError) && ( // Display general error, faceApiError or mediaPipeError
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center p-4 bg-red-900/80 backdrop-blur-sm rounded-lg max-w-md mx-auto z-50 shadow-2xl border border-red-700">
            <AlertTriangle className="h-8 w-8 text-red-300 mx-auto mb-2" />
            <p className="text-red-100 font-semibold mb-1">Error Encountered</p>
            <p className="text-red-200 text-sm">{error || faceApiError || mediaPipeError}</p>
            {/* Show Try Again only for camera errors OR model loading errors */}
            {( (error && error.includes("camera")) || faceApiError || mediaPipeError ) && 
                <Button 
                  onClick={async () => { // Make async for await
                    if ((faceApiError && !modelsReady) || (mediaPipeError && !mediaPipeModelsReady) ) { // If models failed to load, try re-init
                      try {
                          setStatusMessage("Reloading AI models...");
                          setError(null); 
                          setFaceApiError(null);
                          setMediaPipeError(null);
                          
                          if (!modelsReady) { // Check specific to face-api
                           await loadModels(); 
                          }
                          // Re-init MediaPipe (simplified, assumes paths are correct)
                          if (!mediaPipeModelsReady) {
                               const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
                               const reloadedObjectDetector = await ObjectDetector.createFromOptions(vision, {
                                 baseOptions: { modelAssetPath: `/mediapipe-models/efficientdet_lite0.tflite`, delegate: "GPU" },
                                 scoreThreshold: 0.5, runningMode: "VIDEO",
                               });
                               setObjectDetectorState(reloadedObjectDetector); // Use correct setter
                               const reloadedGestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
                                 baseOptions: { modelAssetPath: `/mediapipe-models/gesture_recognizer.task`, delegate: "GPU" },
                                 runningMode: "VIDEO", numHands: 2
                               });
                               setGestureRecognizerState(reloadedGestureRecognizer); // Use correct setter
                               setMediaPipeModelsReady(true);
                               console.log("MediaPipe models reloaded.");
                          }
                          setStatusMessage(null);
                        } catch (errCatch) {
                          console.error("Failed to reload models:", errCatch);
                          const eMsg = errCatch instanceof Error ? errCatch.message : "Model reload failed";
                          // Determine which set of models failed or set a general error
                          if (faceApiError) setFaceApiError(eMsg); else if (mediaPipeError) setMediaPipeError(eMsg); else setError(`AI features reload failed: ${eMsg}.`);
                          setStatusMessage(null);
                        }
                      
                    } else if (error && error.includes("camera")) { // If it's a camera error
                      setupCamera();
                    }
                  }} 
                   
                   
                  className="mt-3 bg-red-600 hover:bg-red-500 text-white"
                >
                  Try Again
                </Button>
             }
           </div>
         )}
         {/* Video element must be rendered even if there's an error for setupCamera to attach to */}
         <video
           ref={videoRef}
           autoPlay
           playsInline
           muted 
           // Use absolute positioning to fill the container more reliably
           className={`absolute inset-0 w-full h-full object-cover ${stream ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`} 
         />
          {/* Loading overlay */} 
          {!stream && !error && !faceApiError && !mediaPipeError && (!modelsReady || !mediaPipeModelsReady) && ( // Show loader if stream not ready OR models not ready and no errors
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-40">
                 <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                 <p className="text-gray-400 mt-2 text-sm">Initializing AI models & camera...</p>
             </div>
         )}
         {/* Status Overlay - Modified to show recording status */} 
         <AnimatePresence>
           {(statusMessage || isRecording) && (
             <motion.div
               key="status-overlay"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-x-0 top-16 flex justify-center z-30 pointer-events-none"
             >
               <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center space-x-2">
                 {isMicListening && <Mic className="h-4 w-4 text-red-500 animate-pulse" />} 
                 {isTranscribing && <Loader2 className="h-4 w-4 animate-spin" />} 
                 {isAnalyzing && !isSpeaking && !isRecording && <Loader2 className="h-4 w-4 animate-spin" />} 
                 {isSpeaking && <Volume2 className="h-4 w-4 text-green-400 animate-pulse" />}
                 {isRecording && statusMessage?.startsWith("Smart recording") && <span className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>}
                 <span>{statusMessage || (isRecording ? "Recording..." : "")}</span>
               </div>
             </motion.div>
           )}
         </AnimatePresence>
         {/* Recording Progress Bar */}
         {isRecording && (
           <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/30 z-30">
             <div 
               className="h-full bg-red-500 transition-all duration-1000" 
               style={{ width: `${(recordingTime % 60) / 60 * 100}%` }}
             ></div>
           </div>
         )}
         {/* Hidden canvas for frame capture */}
         <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
       </div>

       {/* Mobile Carousel - Only show on mobile */}
       {isMobile ? (
         <div 
           {...mobileCardHandlers}
           className="fixed bottom-0 left-0 right-0 z-40 bg-black/30 backdrop-blur-sm py-4"
         >
           <div 
             className="flex overflow-x-auto whitespace-nowrap space-x-4 px-4 scroll-smooth"
             style={{ 
               scrollSnapType: 'x mandatory',
               WebkitOverflowScrolling: 'touch'
             }}
           >
             {mobileCards.map((card, index) => (
               <div 
                 key={card.key}
                 className={`inline-block w-full flex-shrink-0 transition-opacity duration-300 ${
                   activeCardIndex === index ? 'opacity-100' : 'opacity-50 scale-95'
                 }`}
                 style={{ 
                   scrollSnapAlign: 'center',
                   maxWidth: 'calc(100vw - 2rem)'
                 }}
               >
                 {card.content}
               </div>
             ))}
           </div>
           
           {/* Carousel Indicator Dots */}
           <div className="flex justify-center mt-2 space-x-2">
             {mobileCards.map((_, index) => (
               <div 
                 key={index}
                 className={`h-2 w-2 rounded-full ${
                   activeCardIndex === index ? 'bg-white' : 'bg-white/30'
                 }`}
               />
             ))}
           </div>
         </div>
       ) : (
         // Desktop layout - existing stacked cards
         <>
           {/* Identity Card */}
           <div className="absolute top-4 left-4 z-20 pointer-events-none">
             {showCards && (capturedImagePreviewUrl || identityInfoContent) && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 20 }}
                 className="bg-black/29 backdrop-blur-sm rounded-3xl border border-white/20 shadow-md w-full max-w-xs p-4 h-64 overflow-y-auto"
               >
                 {/* Captured Image Preview */}
                 {capturedImagePreviewUrl && (
                   <div className="mb-4 rounded-2xl overflow-hidden shadow-md">
                     <img 
                       src={capturedImagePreviewUrl} 
                       alt="Captured Frame" 
                       className="w-full h-32 object-cover"
                     />
                   </div>
                 )}

                 {/* Identity Info */}
                 {identityInfoContent && (
                   <div className="flex flex-wrap gap-2">
                     {identityInfoContent.split('\n').map((trait, index) => {
                       const cleanTrait = trait.replace('- ', '');
                       let icon = '🤔';
                       if (cleanTrait.includes('Age')) icon = '🎂';
                       if (cleanTrait.includes('Gender')) icon = '👤';
                       if (cleanTrait.includes('Mood')) icon = '😀';

                       return (
                         <div 
                           key={index} 
                           className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs backdrop:blur-md"
                         >
                           {icon} {cleanTrait}
                         </div>
                       );
                     })}
                   </div>
                 )}
               </motion.div>
             )}
           </div>
           
           {/* Objects & Gestures Card */}
           <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
             {showCards && objectCardContent && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 20 }}
                 className="bg-black/29 backdrop-blur-sm rounded-3xl border border-white/20 shadow-md w-full max-w-xs p-4"
               >
                 <h2 className="text-white text-sm font-semibold mb-2">Objects & Gestures</h2>
                 {objectCardContent && (
                   <>
                     <h3 className="text-xs text-gray-300 mb-1">Detected Objects</h3>
                     <div className="flex flex-wrap gap-2 mb-3">
                       {objectCardContent.includes("Detected Objects:") && 
                         objectCardContent.split("\n")
                           .filter(line => line.trim().startsWith("- "))
                           .map((item, index) => (
                             <span 
                               key={index} 
                               className="px-3 py-1 rounded-full bg-white/10 text-white text-xs"
                             >
                               {item.replace("- ", "")}
                             </span>
                           ))
                       }
                     </div>
                   </>
                 )}
               </motion.div>
             )}
           </div>
           
           {/* Scene Analysis Card */}
           <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
             {showCards && aiResponse && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 20 }}
                 className="bg-black/29 backdrop-blur-sm rounded-3xl border border-white/20 shadow-md w-full max-w-sm p-4 h-82 overflow-y-auto"
               >
                 <div className="flex justify-between items-start mb-2 space-x-2">
                   <h3 className="text-sm font-semibold text-white">Scene Analysis</h3>
                   {!isRecording && (
                     <button
                       onClick={() => setAiResponse(null)}
                       className="text-gray-400 hover:text-white -mt-1 -mr-1"
                     >
                       <X className="h-3 w-3" />
                     </button>
                   )}
                 </div>
                 <div className="text-white text-sm leading-snug max-h-40 overflow-y-auto">
                   <ReactMarkdown>{aiResponse}</ReactMarkdown>
                 </div>
               </motion.div>
             )}
           </div>
         </>
       )}

       {/* Existing controls */}
       <footer className="absolute bottom-0 left-0 right-0 flex items-center justify-center p-6 space-x-3 md:space-x-4 z-20 bg-gradient-to-t from-black/50 to-transparent">
          {/* Existing control buttons */}
          <Button 
            onClick={() => router.back()} 
            className="text-white bg-white/10 hover:bg-white/20 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" /> 
          </Button>

          {/* Camera Toggle Button */}
          <Button
            onClick={handleFlipCamera}
            disabled={!stream || isAnalyzing || isMicListening || isTranscribing || isSpeaking || !!error || !modelsReady || !mediaPipeModelsReady || !!faceApiError || !!mediaPipeError || isRecording}
            className="group rounded-full w-12 h-12 p-0 bg-white/20 hover:bg-white/30 border border-white/30 text-white disabled:opacity-50 transition-all duration-200 relative shadow-lg hover:shadow-purple-500/30 hover:border-purple-400"
            aria-label="Toggle Camera"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>

          {/* Camera Button (Analyze Image) */} 
          <Button
            onClick={handleAnalyzeImage}
            disabled={!stream || isAnalyzing || isMicListening || isTranscribing || isSpeaking || !!error || !modelsReady || !mediaPipeModelsReady || !!faceApiError || !!mediaPipeError || isRecording}
            className="group rounded-full w-16 h-16 p-0 bg-white/20 hover:bg-white/30 border border-white/30 text-white disabled:opacity-50 transition-all duration-200 relative shadow-lg hover:shadow-purple-500/30 hover:border-purple-400"
            aria-label="Analyze Image"
          >
            {isAnalyzing && !isMicListening && !isTranscribing && !isSpeaking && !isRecording ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Camera className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                <span className={`absolute inset-0 rounded-full border-2 ${!isAnalyzing && !isMicListening && !isTranscribing && !isSpeaking && !isRecording && stream && modelsReady && mediaPipeModelsReady && !error && !faceApiError && !mediaPipeError ? 'border-white/50 group-hover:border-purple-400 animate-pulse' : 'border-transparent'}`}></span>
              </>
            )}
          </Button>

          {/* Record Button */}
          <Button
            onClick={handleRecordToggle}
            disabled={!stream || isAnalyzing || isMicListening || isTranscribing || isSpeaking || !!error || !modelsReady || !mediaPipeModelsReady || !!faceApiError || !!mediaPipeError}
            className={`group rounded-full w-16 h-16 p-0 border transition-all duration-200 relative shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 ${
              isRecording 
                ? 'bg-red-600/50 border-red-500/70 text-white animate-pulse-yoğun' // Custom intense pulse
                : 'bg-red-600/30 hover:bg-red-600/50 border-red-500/50 text-red-300 hover:text-white'
            }`}
            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
          >
            <CircleDot className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
            {/* Pulsing effect when idle and enabled (and not recording) */}
            {!isAnalyzing && !isMicListening && !isTranscribing && !isSpeaking && !error && stream && modelsReady && mediaPipeModelsReady && !isRecording && !faceApiError && !mediaPipeError && (
                <span className="absolute inset-0 rounded-full border-2 border-red-500/80 animate-pulse group-hover:border-white/50"></span>
            )}
          </Button>

          {/* Voice Input Toggle Button */} 
          <Button
            onClick={handleMicToggle} 
            disabled={!stream || isAnalyzing || isTranscribing || isSpeaking || !!error || !modelsReady || !mediaPipeModelsReady || !!faceApiError || !!mediaPipeError || isRecording}
            className={`group rounded-full w-12 h-12 p-0 border transition-all duration-200 relative shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 ${ 
              isMicListening 
                ? 'bg-red-600/50 border-red-500/70 text-white animate-pulse' 
                : 'bg-purple-600/30 hover:bg-purple-600/50 border-purple-500/50 text-purple-300 hover:text-white'
            }`}
            aria-label={isMicListening ? "Stop Listening" : "Start Listening"}
          >
            {isTranscribing ? (
              <Loader2 className="h-5 w-5 animate-spin" /> 
            ) : (
              <Mic className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" /> 
            )}
            {/* Pulsing effect when idle and enabled */}
            {!isAnalyzing && !isMicListening && !isTranscribing && !isSpeaking && !error && stream && modelsReady && mediaPipeModelsReady && !isRecording && !faceApiError && !mediaPipeError &&(
                <span className="absolute inset-0 rounded-full border-2 border-purple-500/80 animate-pulse group-hover:border-white/50"></span>
            )}
          </Button>
       </footer>
    </div>
  );
} 