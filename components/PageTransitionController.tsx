"use client";

import React, { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTransitionContext } from "@/contexts/TransitionContext"; // Adjust path if needed
import FallingPillars from "./FallingPillars";
import ExpandingCircle from "./ExpandingCircle";

// --- Transition Variant Definitions ---

const DURATION = 0.6;

// Default Fade
const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATION / 2, delay: DURATION / 2 } },
  exit: { opacity: 0, transition: { duration: DURATION / 2 } },
};

// Pillars Effect (Simulated with fast slide + fade)
const pillarsVariants = {
  initial: { opacity: 0, y: 50 }, // Start slightly below and faded
  animate: { opacity: 1, y: 0, transition: { duration: DURATION, ease: "easeOut" } },
  exit: { opacity: 0, y: -50, transition: { duration: DURATION * 0.75, ease: "easeIn" } }, // Exit slightly faster
};

// Circle Effect (Using clipPath)
// Note: Requires transitionOrigin from context
const getCircleVariants = (origin: { x: number; y: number } | null) => {
  const originX = origin ? `${origin.x}px` : '50%';
  const originY = origin ? `${origin.y}px` : '50%';
  const diameter = typeof window !== 'undefined' ? Math.max(window.innerWidth, window.innerHeight) * 2.5 : 2000; // Ensure it covers screen
  
  return {
    initial: {
      clipPath: `circle(0% at ${originX} ${originY})`,
    },
    animate: {
      clipPath: `circle(${diameter}px at ${originX} ${originY})`,
      transition: { duration: DURATION, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      clipPath: `circle(0% at ${originX} ${originY})`,
      transition: { duration: DURATION * 0.8, ease: [0.76, 0, 0.24, 1] }, // Slightly faster exit
    },
  };
};

// Page Push Slide (Existing)
const pagePushVariants = {
  initial: { y: "100%" },
  animate: { y: "0%", transition: { duration: DURATION, ease: [0.34, 1.56, 0.64, 1] } },
  exit: { y: "-100%", transition: { duration: DURATION, ease: [0.36, 0, 0.66, -0.56] } },
};

// --- Component Logic ---

export default function PageTransitionController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    isTransitioning, 
    transitionType, // The type intended for the *incoming* page
    transitionOrigin, // Origin for circle
    targetHref,
    endTransition 
  } = useTransitionContext();

  // Ref to store the type used for the *exit* animation of the PREVIOUS component
  const exitTransitionTypeRef = useRef<typeof transitionType>(null);

  // Store the current transition type to be used for the *next* exit
  useEffect(() => {
      exitTransitionTypeRef.current = transitionType;
  }, [pathname]); // Update when pathname changes

  // Scroll lock logic
  const [isAnimating, setIsAnimating] = useState(false);
   useEffect(() => {
      // Determine if *any* custom transition is likely active based on context or ref
      const likelyTransitioning = !!transitionType || !!exitTransitionTypeRef.current;
      setIsAnimating(likelyTransitioning);
      document.body.style.overflow = likelyTransitioning ? 'hidden' : '';
      let timer: NodeJS.Timeout | null = null;
      if (likelyTransitioning) {
          timer = setTimeout(() => {
              setIsAnimating(false);
              document.body.style.overflow = '';
          }, DURATION * 1000 + 150); // Cleanup timeout
      }
      // Cleanup on unmount or before next effect run
      return () => {
          if (timer) clearTimeout(timer);
          // Ensure scroll is restored if component unmounts mid-transition
          if (document.body.style.overflow === 'hidden') {
              document.body.style.overflow = '';
          }
      };
   }, [pathname, transitionType]); // Re-evaluate on path change or context type change

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

  // Determine which variants to use for the CURRENTLY rendering motion.div
  const getVariants = () => {
    const incomingType = transitionType; // Type for the component being rendered now
    const outgoingType = exitTransitionTypeRef.current; // Type for the component exiting

    console.log(`[Controller] Determining variants for path: ${pathname}. Incoming: ${incomingType}, Outgoing: ${outgoingType}`);

    // Choose variants based primarily on the incoming type
    switch (incomingType) {
      case 'page-push': return pagePushVariants;
      case 'pillars': return pillarsVariants;
      case 'circle': return getCircleVariants(transitionOrigin);
      default:
        // If no specific incoming type, check the outgoing type for exit animation
        switch (outgoingType) {
            case 'page-push': return pagePushVariants; // Use push exit
            case 'pillars': return pillarsVariants; // Use pillars exit
            case 'circle': return getCircleVariants(transitionOrigin); // Use circle exit
            default: return fadeVariants; // Fallback to fade
        }
    }
  };

  return (
    <>
      {/* AnimatePresence for the OVERLAY */} 
      <AnimatePresence mode="wait">
        {transitionType === 'pillars' && <FallingPillars onEnterComplete={navigate} />}
        {transitionType === 'circle' && (
            <ExpandingCircle 
                origin={transitionOrigin}
                onEnterComplete={navigate} 
            />
        )}
      </AnimatePresence>

      {/* AnimatePresence for the PAGE CONTENT (children) */} 
      <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname} 
            variants={getVariants()}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-grow w-full relative overflow-hidden"
            style={{ pointerEvents: isAnimating ? 'none' : 'auto' }}
            onAnimationComplete={(definition) => {
                console.log(`[Controller] Anim complete for ${pathname}: ${definition}`);
                // Reset scroll lock if still locked
                 if (document.body.style.overflow === 'hidden') {
                     document.body.style.overflow = '';
                 }
                 // Reset the ref *after* exit animation completes
                 if (definition === 'exit') {
                     exitTransitionTypeRef.current = null;
                 }
            }}
          >
            {children}
          </motion.div>
      </AnimatePresence>
    </>
  );
} 