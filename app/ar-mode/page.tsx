"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera, Mic, Loader2, AlertTriangle, Volume2, X, RefreshCw, CircleDot } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
// Import the new service function
import { getGroqVisionAnalysis, getGroqTranscription } from "@/lib/groq-service"
import { speakText } from "@/lib/tts-service"
import dynamic from 'next/dynamic'

const ARModeContent = dynamic(() => import('@/app/ar-mode/ar-mode-content'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-purple-400 mb-4" />
      <p className="text-lg text-gray-300">Loading AR Experience...</p>
    </div>
  ),
})

export default function ARModePageLoader() {
  // The dynamic import with ssr:false handles client-side rendering.
  // The loading component from dynamic import will be shown initially.
  return <ARModeContent />;
}
