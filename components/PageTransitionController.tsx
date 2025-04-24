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
  animate: { opacity: 1, transition: { duration: 0.4, delay: 0.4 } }, // Fade in after overlay animation starts
  exit: { opacity: 0, transition: { duration: 0.2 } }, // Fade out quickly
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

  // Scroll to top on pathname change (when not actively transitioning)
  useEffect(() => {
    if (!isTransitioning) {
        window.scrollTo(0, 0);
    }
  }, [pathname, isTransitioning]);

  const handleAnimationComplete = () => {
    console.log("[Controller] Overlay animation complete.");
    if (targetHref) {
      console.log(`[Controller] Navigating to ${targetHref}`);
      router.push(targetHref); // Navigate after animation
      // endTransition will be called by the overlay component's onAnimationComplete/exit
    } else {
        // If targetHref is somehow null, ensure transition ends
        console.warn("[Controller] Animation complete but no targetHref found. Ending transition.")
        endTransition();
    }
  };

  // Render the correct overlay based on the context
  const renderTransitionOverlay = () => {
    if (!isTransitioning) return null;

    switch (transitionType) {
      case 'pillars':
        // FallingPillars needs to know when to end the transition
        return <FallingPillars onComplete={handleAnimationComplete} />;
      case 'circle':
        // ExpandingCircle needs origin and callback
        return (
            <ExpandingCircle 
                origin={transitionOrigin}
                onComplete={handleAnimationComplete} 
            />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence 
      mode="wait"
      initial={false}
      onExitComplete={() => {
        // Optional: can also reset scroll here if needed after exit
        console.log("[AnimatePresence] Exit complete.");
      }}
    >
      {/* Render the overlay - its presence is controlled by isTransitioning state */} 
      {renderTransitionOverlay()}

      {/* Animate the page content - keyed by pathname */} 
      {!isTransitioning && (
        <motion.div
          key={pathname} // AnimatePresence tracks this changing
          initial="initial"
          animate="animate"
          exit="exit"
          variants={contentVariants}
          className="flex-grow"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 