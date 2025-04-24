"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTransitionContext } from "@/contexts/TransitionContext"; // Adjust path if needed
import FallingPillars from "./FallingPillars";
import ExpandingCircle from "./ExpandingCircle";

// Variants for content when overlay is used
const overlayContentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, delay: 0.5 } }, 
  exit: { opacity: 0, transition: { duration: 0.2 } }, 
};

// REMOVED: fadeSlideVariants

export default function PageTransitionController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    isTransitioning, 
    transitionType, // Should only be pillars/circle
    transitionOrigin,
    targetHref,
    endTransition 
  } = useTransitionContext();

  // REMOVED: activeContentType state
  const [contentHasAnimatedIn, setContentHasAnimatedIn] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
       setContentHasAnimatedIn(false);
       console.log(`[Controller] Transition START. Type: ${transitionType}, Target: ${targetHref}`);
    } 
    // REMOVED: else block and activeContentType logic
  }, [isTransitioning, transitionType, targetHref]); 

  useEffect(() => {
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

  // REMOVED: handleExitComplete (not needed without fade-slide)
  
  // Simplified animation complete handler (only for overlays)
  const handleAnimateComplete = () => {
      console.log(`[Controller] handleAnimateComplete called.`);
      // If new content finished animating IN (after overlay), flag it to trigger overlay exit
      console.log("[Controller] Overlay content finished entering. Flagging for overlay exit.");
      setContentHasAnimatedIn(true);
      // REMOVED: fade-slide else if block
  }

  // Effect to trigger overlay exit *after* content has animated in
  useEffect(() => {
    // Simplified condition
    if (contentHasAnimatedIn && isTransitioning) {
      console.log("[Controller] Content entered. Calling endTransition() to trigger overlay exit.");
      endTransition(); 
      setContentHasAnimatedIn(false);
    }
    // Removed activeContentType dependency
  }, [contentHasAnimatedIn, isTransitioning, endTransition]);

  const renderTransitionOverlay = () => {
    // Simplified guard
    if (!isTransitioning || !transitionType) return null; 

    console.log(`[Controller] Rendering overlay: ${transitionType}`);
    switch (transitionType) {
      case 'pillars':
        return <FallingPillars onEnterComplete={navigateAfterOverlayEnter} />;
      case 'circle':
        return <ExpandingCircle origin={transitionOrigin} onEnterComplete={navigateAfterOverlayEnter} />;
      default:
        // Should not happen with current types, but good practice
        console.warn(`[Controller] Unknown transitionType: ${transitionType}`);
        return null;
    }
  };

  // Always use overlay variants now
  const currentContentVariants = overlayContentVariants;

  return (
    <>
      <AnimatePresence mode="wait" onExitComplete={() => console.log("[Controller] Overlay exit complete.")}>
        {isTransitioning && renderTransitionOverlay()} 
      </AnimatePresence>

      {/* PAGE CONTENT AnimatePresence - Removed onExitComplete */} 
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => console.log("[Controller] Content exit complete.")}>
          <motion.div
            key={pathname} 
            initial="initial"
            animate="animate"
            exit="exit"
            variants={currentContentVariants} 
            onAnimationComplete={handleAnimateComplete} // Simplified handler
            className="flex-grow"
            style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }}
          >
            {children}
          </motion.div>
      </AnimatePresence>
    </>
  );
} 