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
  animate: { opacity: 1, transition: { duration: 0.4, delay: 0.6 } },
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

  const [activeContentType, setActiveContentType] = useState<'default' | 'page-push' | null>(null);

  useEffect(() => {
    if (isTransitioning) {
       setActiveContentType(transitionType === 'page-push' ? 'page-push' : 'default');
    } else {
        setActiveContentType(null);
    }
  }, [isTransitioning, transitionType]);

  useEffect(() => {
    if (!isTransitioning) {
        window.scrollTo(0, 0);
    }
    document.body.style.overflow = isTransitioning ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isTransitioning]);

  const navigate = () => {
    if (targetHref) {
      console.log(`[Controller] Navigating to ${targetHref} after overlay enter.`);
      router.push(targetHref);
    } else {
        console.warn("[Controller] Overlay enter complete but no targetHref.");
    }
  };

  const handleContentAnimationComplete = (definition: string) => {
     if (definition === 'animate' && activeContentType === 'page-push') {
         console.log("[Controller] Page Push content enter complete. Ending transition.");
         endTransition();
     }
  };

  const renderTransitionOverlay = () => {
    if (!transitionType || transitionType === 'page-push') return null; 

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

  const currentContentVariants = activeContentType === 'page-push' ? pagePushVariants : defaultContentVariants;

  return (
    <>
      {/* OVERLAY AnimatePresence */} 
      <AnimatePresence mode="wait">
        {isTransitioning && renderTransitionOverlay()} 
      </AnimatePresence>

      {/* PAGE CONTENT AnimatePresence */} 
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