"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTransitionContext } from "@/contexts/TransitionContext"; // Adjust path if needed
import FallingPillars from "./FallingPillars";
import ExpandingCircle from "./ExpandingCircle";

// Define animation variants for the page content itself (simple fade)
const contentVariants = {
  initial: { opacity: 0 },
  // Delay fade-in until after the overlay has had time to animate *in*
  animate: { opacity: 1, transition: { duration: 0.4, delay: 0.7 } }, 
  exit: { opacity: 0, transition: { duration: 0.2 } }, // Fade out quickly before overlay animates
};

export default function PageTransitionController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    isTransitioning, 
    transitionType, 
    transitionOrigin,
    targetHref,
    // endTransition is now called by overlay components on their exit
  } = useTransitionContext();

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

  // Renamed for clarity: This function is called by the overlay when its ENTER animation is done.
  const handleOverlayEnterComplete = () => {
    console.log("[Controller] Overlay ENTER animation complete.");
    if (targetHref) {
      console.log(`[Controller] Navigating to ${targetHref}`);
      router.push(targetHref); // Navigate after overlay has animated in
      // NOTE: isTransitioning remains true until the overlay component finishes its EXIT animation and calls endTransition()
    } else {
        console.warn("[Controller] Overlay enter complete but no targetHref found? This shouldn't happen.")
        // Potentially call endTransition() here as a fallback if needed, but should be handled by overlay exit
    }
  };

  // Render the correct overlay based on the context
  const renderTransitionOverlay = () => {
    // No need to check isTransitioning here, AnimatePresence handles it
    console.log(`[Controller] Rendering overlay: ${transitionType}`);

    switch (transitionType) {
      case 'pillars':
        // Pass the navigation callback
        return <FallingPillars onEnterComplete={handleOverlayEnterComplete} />;
      case 'circle':
        // Pass origin and navigation callback
        return (
            <ExpandingCircle 
                origin={transitionOrigin}
                onEnterComplete={handleOverlayEnterComplete} 
            />
        );
      default:
        console.warn(`[Controller] Unknown transitionType: ${transitionType}`);
        return null;
    }
  };

  return (
    <>
      {/* AnimatePresence for the OVERLAY */} 
      <AnimatePresence mode="wait">
        {/* Conditionally render the overlay based on isTransitioning */} 
        {/* The overlay component defines its own enter/exit animations */} 
        {/* It calls endTransition via context on exit animation complete */} 
        {isTransitioning && renderTransitionOverlay()}
      </AnimatePresence>

      {/* AnimatePresence for the PAGE CONTENT (children) */} 
      {/* Keyed by pathname, exit happens first, then new content enters */} 
      <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname} // AnimatePresence tracks this changing
            initial="initial"
            animate="animate"
            exit="exit"
            variants={contentVariants}
            className="flex-grow"
            style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }} // Disable interaction during transition
          >
            {children}
          </motion.div>
      </AnimatePresence>
    </>
  );
} 