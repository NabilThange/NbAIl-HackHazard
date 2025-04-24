"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTransitionContext } from "@/contexts/TransitionContext"; // Adjust path if needed
import FallingPillars from "./FallingPillars";
import ExpandingCircle from "./ExpandingCircle";

// Default variants for content when overlay is used
const overlayContentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, delay: 0.8 } }, 
  exit: { opacity: 0, transition: { duration: 0.2 } }, 
};

// RE-ADD: Variants for Fade & Slide transition
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
    transitionType, // Type includes fade-slide again
    transitionOrigin,
    targetHref,
    endTransition 
  } = useTransitionContext();

  // RE-ADD: activeContentType state
  const [activeContentType, setActiveContentType] = useState<'overlay' | 'fade-slide' | null>(null);
  
  const [contentHasAnimatedIn, setContentHasAnimatedIn] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
       // RE-ADD: Logic to set activeContentType based on transitionType
       setActiveContentType(transitionType === 'fade-slide' ? 'fade-slide' : 'overlay');
       setContentHasAnimatedIn(false);
       console.log(`[Controller] Transition START. Type: ${transitionType}, ActiveContentType: ${activeContentType}, Target: ${targetHref}`);
    } else {
        setActiveContentType(null); // Reset on end
    }
    // Added activeContentType back to dependency array
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

  // Re-introduce handleExitComplete for fade-slide navigation
  const handleExitComplete = () => {
      console.log("[Controller] handleExitComplete called.");
      if (activeContentType === 'fade-slide' && targetHref) {
         console.log("[Controller] Fade-Slide exit complete. Navigating...");
         router.push(targetHref);
      }
  }

  // Re-introduce handleAnimateComplete logic for fade-slide cleanup
  const handleAnimateComplete = () => {
      console.log(`[Controller] handleAnimateComplete called. ActiveType: ${activeContentType}`);
      if (activeContentType === 'overlay') {
         console.log("[Controller] Overlay content finished entering. Flagging for overlay exit.");
         setContentHasAnimatedIn(true);
      }
      else if (activeContentType === 'fade-slide') {
          console.log("[Controller] Fade-Slide enter complete. Ending transition.");
          endTransition();
      }
  }

  // Effect to trigger overlay exit (no changes here)
  useEffect(() => {
    if (contentHasAnimatedIn && isTransitioning && activeContentType === 'overlay') {
      console.log("[Controller] Content entered. Calling endTransition() to trigger overlay exit.");
      endTransition(); 
      setContentHasAnimatedIn(false);
    }
  }, [contentHasAnimatedIn, isTransitioning, activeContentType, endTransition]);

  const renderTransitionOverlay = () => {
    // Re-add guard against fade-slide
    if (!isTransitioning || !transitionType || transitionType === 'fade-slide') return null; 

    console.log(`[Controller] Rendering overlay: ${transitionType}`);
    switch (transitionType) {
      case 'pillars':
        return <FallingPillars onEnterComplete={navigateAfterOverlayEnter} />;
      case 'circle':
        return <ExpandingCircle origin={transitionOrigin} onEnterComplete={navigateAfterOverlayEnter} />;
      default:
        return null;
    }
  };

  // Re-add logic to select variants based on activeContentType
  const currentContentVariants = activeContentType === 'fade-slide' ? fadeSlideVariants : overlayContentVariants;

  return (
    <>
      {/* OVERLAY AnimatePresence (no changes) */} 
      <AnimatePresence mode="wait" onExitComplete={() => console.log("[Controller] Overlay exit complete.")}>
        {isTransitioning && renderTransitionOverlay()} 
      </AnimatePresence>

      {/* PAGE CONTENT AnimatePresence (re-add onExitComplete) */} 
      <AnimatePresence 
         mode="wait" 
         initial={false} 
         onExitComplete={handleExitComplete} // RE-ADDED
      >
          <motion.div
            key={pathname} 
            initial="initial"
            animate="animate"
            exit="exit"
            variants={currentContentVariants} // Use dynamic variants again
            onAnimationComplete={handleAnimateComplete} 
            className="flex-grow"
            style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }}
          >
            {children}
          </motion.div>
      </AnimatePresence>
    </>
  );
} 