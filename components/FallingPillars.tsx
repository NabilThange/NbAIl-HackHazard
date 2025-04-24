"use client";

import { motion } from "framer-motion";
import { useTransitionContext } from "@/contexts/TransitionContext";

// UPDATED: Pillar count
const pillarCount = 6; 

// UPDATED: Container variants - only need exit now, enter handled by pillars
const containerVariants = {
  initial: {},
  animate: {},
  exit: {
    transition: {
      staggerChildren: 0.06, // Stagger pillars falling down
      // staggerDirection: -1, // No longer needed for exit
    },
  },
};

// UPDATED: Pillar variants for fall down (enter) and fall out (exit)
const pillarVariants = {
  initial: { y: "-100%" }, // Start above screen
  enter: { 
    y: "0%", 
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } // Faster fall
  },
  exit: { 
    y: "100%", // Fall down off screen
    transition: { duration: 0.4, ease: [0.64, 0, 0.78, 0] } // Different ease for exit
  },
};

interface FallingPillarsProps {
  onComplete: () => void;
}

export default function FallingPillars({ onComplete }: FallingPillarsProps) {
  const { endTransition } = useTransitionContext();

  return (
    <motion.div
      key="pillars-container"
      variants={containerVariants} // Staggers the exit animation
      initial="initial"
      animate="enter"
      exit="exit" // Trigger exit variant on container
      onAnimationComplete={(definition) => {
        // Trigger navigation when ENTER animation of the LAST pillar theoretically completes
        // We approximate this by using a timeout based on stagger and duration
        if (definition === 'enter') {
            const totalEnterDuration = 0.1 + (pillarCount * 0.07) + 0.4; // delayChildren + stagger + pillar duration
            console.log(`[FallingPillars] Enter animation started. Triggering navigation in ~${totalEnterDuration.toFixed(2)}s`);
            setTimeout(() => {
                console.log("[FallingPillars] Calling onComplete (navigation)...");
                onComplete(); 
            }, totalEnterDuration * 1000);
        }
         // End the transition process when the container's EXIT animation completes
         // which happens after all children have finished their exit
        if (definition === 'exit') {
            console.log("[FallingPillars] Exit animation complete. Ending transition.");
            endTransition();
        }
      }}
      // UPDATED: Styling
      className="pointer-events-none fixed inset-0 z-[9999] flex overflow-hidden"
    >
      {[...Array(pillarCount)].map((_, i) => (
        <motion.div
          key={`pillar-${i}`}
          variants={pillarVariants} // Pillars animate based on container stagger
          // UPDATED: Styling
          className="relative h-full bg-black rounded-lg" // Black bg, rounded
          style={{ width: `${100 / pillarCount}vw` }} // Wider pillars
        />
      ))}
    </motion.div>
  );
} 