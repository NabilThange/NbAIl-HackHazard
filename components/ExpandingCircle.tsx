"use client";

import { motion } from "framer-motion";
import { useTransitionContext } from "@/contexts/TransitionContext";

interface ExpandingCircleProps {
  origin: { x: number; y: number } | null;
  onComplete: () => void;
}

export default function ExpandingCircle({ origin, onComplete }: ExpandingCircleProps) {
  const { endTransition } = useTransitionContext();

  // Variants for the expanding circle
  const circleVariants = {
    initial: {
      scale: 0,
      opacity: 1,
      // Position will be set via style prop
    },
    animate: {
      scale: 150,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.4, ease: "easeIn", delay: 0.2 },
    },
  };

  // Default to center if origin is somehow null
  const initialX = origin ? origin.x : window.innerWidth / 2;
  const initialY = origin ? origin.y : window.innerHeight / 2;

  return (
    <motion.div
      key="expanding-circle"
      variants={circleVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onAnimationComplete={(definition) => {
        // Trigger navigation when enter animation completes
        if (definition === 'animate') { // Using 'animate' as the target state name
             console.log("[ExpandingCircle] Animate animation complete.");
            onComplete();
        }
         // End the transition process when exit animation completes
        if (definition === 'exit') {
             console.log("[ExpandingCircle] Exit animation complete.");
            endTransition();
        }
      }}
      className="pointer-events-none fixed z-[9998] aspect-square w-4 rounded-full bg-purple-600 origin-center"
      style={{ 
        top: initialY, 
        left: initialX,
        // Use translate(-50%, -50%) to center the small circle on the origin point
        x: "-50%",
        y: "-50%"
      }} 
    />
  );
} 