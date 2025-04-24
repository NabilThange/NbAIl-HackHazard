"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTransitionContext } from "@/contexts/TransitionContext"; // Adjust path if needed
import FallingPillars from "./FallingPillars";
import ExpandingCircle from "./ExpandingCircle";

// Default variants (fade) for content when overlay is used
const defaultContentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, delay: 0.6 } }, // Delay to match overlay approx end
  exit: { opacity: 0, transition: { duration: 0.2 } }, 
};

// Variants for the Page Push Slide transition
const pagePushVariants = {
  initial: { y: "100%", opacity: 1 }, // Start below view, but opaque
  animate: { y: "0%", transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } }, // Overshoot ease
  exit: { y: "-100%", transition: { duration: 0.5, ease: [0.36, 0, 0.66, -0.56] } }, // Anticipate ease
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

  // State to hold the type of transition currently animating the *content*
  const [activeTransitionType, setActiveTransitionType] = useState(transitionType);

  // Update active transition type when a new transition begins
  useEffect(() => {
    if (isTransitioning) {
      console.log(`[Controller] Setting active transition type: ${transitionType}`);
      setActiveTransitionType(transitionType);
    }
  }, [isTransitioning, transitionType]);

  // Scroll to top on pathname change (when not actively transitioning)
  useEffect(() => {
    if (!isTransitioning) {
        window.scrollTo(0, 0);
    }
    // Disable body scroll during transition
    document.body.style.overflow = isTransitioning ? 'hidden' : '';
    // Cleanup function to restore scroll on unmount or when transition ends
    return () => { document.body.style.overflow = ''; };
  }, [isTransitioning]); // Rerun when transition state changes

  const navigate = () => {
    console.log("[Controller] navigate called.");
    if (targetHref) {
      console.log(`[Controller] Navigating to ${targetHref}`);
      router.push(targetHref);
      // IMPORTANT: Overlay components call endTransition on their *exit*.
      // For page-push, we need to call endTransition after the *new* page content finishes animating *in*.
    } else {
        console.warn("[Controller] navigate called but no targetHref.")
    }
  };

  const handleContentAnimationComplete = (definition: string) => {
     // If the new page content has finished entering *and* it was a page-push transition
     if (definition === 'animate' && activeTransitionType === 'page-push') {
         console.log("[Controller] Page Push content enter complete. Ending transition.");
         endTransition();
         setActiveTransitionType(null); // Reset active type
     }
     // If an overlay was used, its exit handler calls endTransition.
     // Reset active type if exiting non-page-push content
     if (definition === 'exit' && activeTransitionType !== 'page-push') {
       setActiveTransitionType(null);
     }
  };

  const renderTransitionOverlay = () => {
    console.log(`[Controller] Checking overlay. Type: ${transitionType}, isTransitioning: ${isTransitioning}`);
    // Only render overlays for their specific types
    if (!isTransitioning || (transitionType !== 'pillars' && transitionType !== 'circle')) {
        return null;
    }

    console.log(`[Controller] Rendering overlay: ${transitionType}`);
    switch (transitionType) {
      case 'pillars':
        return <FallingPillars onEnterComplete={navigate} />;
      case 'circle':
        return (
            <ExpandingCircle 
                origin={transitionOrigin}
                onEnterComplete={navigate} 
            />
        );
      default:
        return null;
    }
  };

  // Determine which variants to use for the content
  const currentContentVariants = activeTransitionType === 'page-push' ? pagePushVariants : defaultContentVariants;

  return (
    <>
      {/* AnimatePresence for the OVERLAY */} 
      <AnimatePresence mode="wait">
        {renderTransitionOverlay()}
      </AnimatePresence>

      {/* AnimatePresence for the PAGE CONTENT (children) */} 
      <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname} 
            initial="initial"
            animate="animate"
            exit="exit"
            variants={currentContentVariants} // Use dynamically selected variants
            onAnimationComplete={handleContentAnimationComplete} // Handle cleanup for page-push
            className="flex-grow"
            style={{ 
                pointerEvents: isTransitioning ? 'none' : 'auto' 
            }}
          >
            {children}
          </motion.div>
      </AnimatePresence>
    </>
  );
} 