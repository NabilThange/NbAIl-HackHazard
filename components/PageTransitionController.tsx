"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useTransitionContext } from "@/contexts/TransitionContext"; // Adjust path if needed
import FallingPillars from "./FallingPillars";
import ExpandingCircle from "./ExpandingCircle";

// Variants for default content (fade) used with overlays
const overlayContentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, delay: 0.8 } }, // Increased delay 
  exit: { opacity: 0, transition: { duration: 0.2 } }, 
};

// Variants for Fade & Slide transition (NEW)
const fadeSlideVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" } },
  exit: { opacity: 0, y: 30, transition: { duration: 0.4, ease: "easeInOut" } },
};

export default function PageTransitionController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    isTransitioning, 
    transitionType, // Type of the transition *being initiated*
    transitionOrigin,
    targetHref,
    endTransition 
  } = useTransitionContext();

  // State to track the type of transition affecting the content div
  const [activeContentType, setActiveContentType] = useState<'overlay' | 'fade-slide' | null>(null);
  // State to track if content has finished animating IN (used to trigger overlay exit)
  const [contentHasAnimatedIn, setContentHasAnimatedIn] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
       // Determine content animation type
       setActiveContentType(transitionType === 'fade-slide' ? 'fade-slide' : 'overlay');
       setContentHasAnimatedIn(false);
       console.log(`[Controller] Transition START. Type: ${transitionType}, ActiveContentType: ${activeContentType}, Target: ${targetHref}`);
    } else {
        setActiveContentType(null);
    }
  }, [isTransitioning, transitionType, targetHref, activeContentType]);

  useEffect(() => {
    // Scroll lock logic
    if (!isTransitioning) {
        window.scrollTo(0, 0);
    }
    document.body.style.overflow = isTransitioning ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isTransitioning]);

  const navigateAfterOverlayEnter = () => {
    if (targetHref) {
      console.log(`[Controller] Overlay enter complete. Navigating to ${targetHref}.`);
      router.push(targetHref);
    } else {
        console.warn("[Controller] navigateAfterOverlayEnter called but no targetHref.");
    }
  };

  // Separate handler specifically for the EXITING content's completion
  const handleExitComplete = () => {
      console.log("[Controller] handleExitComplete called.");
      // Trigger navigation ONLY if it was a fade-slide transition
      if (activeContentType === 'fade-slide' && targetHref) {
         console.log("[Controller] Fade-Slide exit complete. Navigating...");
         router.push(targetHref);
      }
  }

  // Handler for the ENTERING content's completion
  const handleAnimateComplete = () => {
      console.log(`[Controller] handleAnimateComplete called. ActiveType: ${activeContentType}`);
      // If new content finished animating IN (after overlay), flag it to trigger overlay exit
      if (activeContentType === 'overlay') {
         console.log("[Controller] Overlay content finished entering. Flagging for overlay exit.");
         setContentHasAnimatedIn(true);
      }
      // If entering page finished (fade-slide), end the transition
      else if (activeContentType === 'fade-slide') {
          console.log("[Controller] Fade-Slide enter complete. Ending transition.");
          endTransition();
      }
  }

  // Effect to trigger overlay exit *after* content has animated in
  useEffect(() => {
    if (contentHasAnimatedIn && isTransitioning && activeContentType === 'overlay') {
      console.log("[Controller] Content entered. Calling endTransition() to trigger overlay exit.");
      endTransition(); 
      setContentHasAnimatedIn(false);
    }
  }, [contentHasAnimatedIn, isTransitioning, activeContentType, endTransition]);

  const renderTransitionOverlay = () => {
    // Guard: Only render for pillars/circle types and when transitioning
    if (!isTransitioning || !transitionType || transitionType === 'fade-slide') return null; 

    console.log(`[Controller] Rendering overlay: ${transitionType}`);
    switch (transitionType) {
      case 'pillars':
        return <FallingPillars onEnterComplete={navigateAfterOverlayEnter} />;
      case 'circle':
        return (
            <ExpandingCircle 
                origin={transitionOrigin}
                onEnterComplete={navigateAfterOverlayEnter} 
            />
        );
      default:
        return null;
    }
  };

  // Determine variants for the content based on the *active* content animation type
  const currentContentVariants = activeContentType === 'fade-slide' ? fadeSlideVariants : overlayContentVariants;

  return (
    <>
      {/* OVERLAY AnimatePresence */} 
      <AnimatePresence mode="wait" onExitComplete={() => console.log("[Controller] Overlay exit complete.")}>
        {isTransitioning && renderTransitionOverlay()} 
      </AnimatePresence>

      {/* PAGE CONTENT AnimatePresence */} 
      <AnimatePresence 
         mode="wait" 
         initial={false} 
         onExitComplete={handleExitComplete} // Use onExitComplete for exit logic
      >
          <motion.div
            key={pathname} 
            initial="initial"
            animate="animate"
            exit="exit"
            variants={currentContentVariants}
            onAnimationComplete={handleAnimateComplete} // Use onAnimationComplete for enter logic
            className="flex-grow"
            style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }}
          >
            {children}
          </motion.div>
      </AnimatePresence>
    </>
  );
} 