"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTransitionContext } from "@/contexts/TransitionContext"; // Adjust path if needed
import FallingPillars from "./FallingPillars";
import ExpandingCircle from "./ExpandingCircle";

// Default variants (fade) for content when overlay is used
const overlayContentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, delay: 0.8 } }, 
  exit: { opacity: 0, transition: { duration: 0.2 } }, 
};

export default function PageTransitionController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    isTransitioning, 
    transitionType, // Should now only be 'pillars' or 'circle' when isTransitioning is true
    transitionOrigin,
    targetHref,
    endTransition 
  } = useTransitionContext();

  // State to track if content has finished animating IN (used to trigger overlay exit)
  const [contentHasAnimatedIn, setContentHasAnimatedIn] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
       // Reset animation flag when a new transition starts
       setContentHasAnimatedIn(false);
       console.log(`[Controller] Transition START. Type: ${transitionType}, Target: ${targetHref}`);
    } 
  }, [isTransitioning, transitionType, targetHref]);

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

  // Callback for content animations - ONLY for overlay logic now
  const handleContentAnimationComplete = (definition: string) => {
     console.log(`[Controller] Content animation complete: ${definition}`);
     // If new content finished animating IN (after overlay), flag it to trigger overlay exit
     if (definition === 'animate') {
        console.log("[Controller] Overlay content finished entering. Flagging for overlay exit.");
        setContentHasAnimatedIn(true);
     }
  };
  
  // Effect to trigger overlay exit *after* content has animated in
  useEffect(() => {
    // Simplified condition: Only check if content is in and an overlay transition is active
    if (contentHasAnimatedIn && isTransitioning) {
      console.log("[Controller] Content entered. Calling endTransition() to trigger overlay exit.");
      endTransition(); 
      setContentHasAnimatedIn(false); // Reset flag
    }
  }, [contentHasAnimatedIn, isTransitioning, endTransition]);

  const renderTransitionOverlay = () => {
    // Guard: Only render when an overlay transition is active
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

  // Variants are now always the overlay content variants
  const currentContentVariants = overlayContentVariants;

  return (
    <>
      {/* OVERLAY AnimatePresence */} 
      <AnimatePresence mode="wait" onExitComplete={() => console.log("[Controller] Overlay exit complete.")}>
        {isTransitioning && renderTransitionOverlay()} 
      </AnimatePresence>

      {/* PAGE CONTENT AnimatePresence */} 
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => console.log("[Controller] Content exit complete.")}>
          <motion.div
            key={pathname} 
            initial="initial"
            animate="animate"
            exit="exit"
            variants={currentContentVariants} // Always use overlay variants
            onAnimationComplete={handleContentAnimationComplete} 
            className="flex-grow"
            style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }}
          >
            {children}
          </motion.div>
      </AnimatePresence>
    </>
  );
} 