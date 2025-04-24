"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTransitionContext } from "@/contexts/TransitionContext"; // Adjust path if needed
import FallingPillars from "./FallingPillars";
import ExpandingCircle from "./ExpandingCircle";

// Default variants (fade) for content
const defaultContentVariants = {
  initial: { opacity: 0 },
  animate: { 
      opacity: 1, 
      transition: { 
          duration: 0.4, 
          delay: 0.8 // LONGER DELAY: Increased delay before content fades in
      } 
  },
  exit: { opacity: 0, transition: { duration: 0.2 } }, 
};

// Variants for Page Push Slide
const pagePushVariants = {
  initial: { y: "100%", opacity: 1 },
  animate: { y: "0%", transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } },
  exit: { y: "-100%", transition: { duration: 0.5, ease: [0.36, 0, 0.66, -0.56] } },
};

export default function PageTransitionController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    isTransitioning, 
    transitionType, 
    transitionOrigin,
    targetHref,
    endTransition 
  } = useTransitionContext();

  // State to track the type of transition affecting the content div
  const [activeContentType, setActiveContentType] = useState<'default' | 'page-push' | null>(null);
  // State to track if content has finished animating IN (used to trigger overlay exit)
  const [contentHasAnimatedIn, setContentHasAnimatedIn] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
       // Determine content type and reset animation flag when a new transition starts
       setActiveContentType(transitionType === 'page-push' ? 'page-push' : 'default');
       setContentHasAnimatedIn(false);
       console.log(`[Controller] Transition START. Type: ${transitionType}, ActiveContentType: ${transitionType === 'page-push' ? 'page-push' : 'default'}`);
    } else {
        // Reset when not transitioning
        setActiveContentType(null);
    }
  }, [isTransitioning, transitionType]);

  useEffect(() => {
    // Scroll lock logic
    if (!isTransitioning) {
        window.scrollTo(0, 0);
    }
    document.body.style.overflow = isTransitioning ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isTransitioning]);

  // Callback for overlays to trigger navigation after they finish entering
  const navigateAfterOverlayEnter = () => {
    if (targetHref) {
      console.log(`[Controller] Overlay enter complete. Navigating to ${targetHref}.`);
      router.push(targetHref);
    } else {
        console.warn("[Controller] navigateAfterOverlayEnter called but no targetHref.");
    }
  };

  // Callback for content animations
  const handleContentAnimationComplete = (definition: string) => {
     console.log(`[Controller] Content animation complete: ${definition}, ActiveType: ${activeContentType}`);
     // --- Page Push Logic ---
     if (activeContentType === 'page-push') {
       // If exiting page finished sliding UP, trigger navigation
       if (definition === 'exit' && targetHref) {
         console.log("[Controller] Page Push exit complete. Navigating...");
         router.push(targetHref);
       }
       // If entering page finished sliding IN, end the transition
       else if (definition === 'animate') {
         console.log("[Controller] Page Push enter complete. Ending transition.");
         endTransition();
       }
     }
     // --- Overlay Logic --- 
     else if (activeContentType === 'default') {
       // If new content finished animating IN (after overlay), flag it
       if (definition === 'animate') {
          console.log("[Controller] Default content (after overlay) finished entering.");
          setContentHasAnimatedIn(true);
       }
     }
  };
  
  // Effect to trigger overlay exit *after* content has animated in
  useEffect(() => {
    if (contentHasAnimatedIn && isTransitioning && activeContentType === 'default') {
      console.log("[Controller] Content entered. Calling endTransition() to trigger overlay exit.");
      endTransition(); 
      setContentHasAnimatedIn(false); // Reset flag
    }
  }, [contentHasAnimatedIn, isTransitioning, activeContentType, endTransition]);

  const renderTransitionOverlay = () => {
    // Guard: Only render for specific types and when transitioning
    if (!isTransitioning || !transitionType || transitionType === 'page-push') return null; 

    console.log(`[Controller] Rendering overlay: ${transitionType}`);
    switch (transitionType) {
      case 'pillars':
        // Overlays no longer call endTransition themselves
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

  // Determine variants for the content based on the *active* transition type
  const currentContentVariants = activeContentType === 'page-push' ? pagePushVariants : defaultContentVariants;

  return (
    <>
      {/* OVERLAY AnimatePresence */} 
      {/* Rendered only when isTransitioning=true and type is pillars/circle */} 
      {/* Exits when isTransitioning becomes false (triggered by endTransition) */} 
      <AnimatePresence mode="wait" onExitComplete={() => console.log("[Controller] Overlay exit complete.")}>
        {isTransitioning && renderTransitionOverlay()} 
      </AnimatePresence>

      {/* PAGE CONTENT AnimatePresence */} 
      {/* Always manages the motion.div based on pathname key */} 
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => console.log("[Controller] Content exit complete.")}>
          <motion.div
            key={pathname} 
            initial="initial"
            animate="animate"
            exit="exit"
            variants={currentContentVariants}
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