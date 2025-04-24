"use client";

import { motion } from "framer-motion";

interface ExpandingCircleProps {
  origin: { x: number; y: number } | null;
  onEnterComplete: () => void;
}

export default function ExpandingCircle({ origin, onEnterComplete }: ExpandingCircleProps) {
  // Variants for the expanding circle
  const circleVariants = {
    initial: {
      scale: 0,
      opacity: 1,
    },
    animate: {
      scale: 150,
      opacity: 1,
      transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      scale: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] },
    },
  };

  // Default to center if origin is somehow null
  const initialX = origin ? origin.x : (typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const initialY = origin ? origin.y : (typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

  return (
    <motion.div
      key="expanding-circle"
      variants={circleVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onAnimationComplete={(definition) => {
        // Trigger navigation when 'animate' (enter) completes
        if (definition === 'animate') {
             console.log("[ExpandingCircle] Animate (enter) complete. Calling onEnterComplete (navigation).");
            onEnterComplete();
        }
        // Log exit completion for debugging
        if (definition === 'exit') {
            console.log("[ExpandingCircle] Exit complete.");
        }
      }}
      className="pointer-events-none fixed z-[9999] aspect-square w-4 rounded-full bg-purple-600 origin-center"
      style={{ 
        top: initialY, 
        left: initialX,
        x: "-50%",
        y: "-50%"
      }} 
    />
  );
} 