"use client";

import { motion } from "framer-motion";
import React from "react";

// UPDATED: Pillar count
const pillarCount = 6; 

// UPDATED: Container variants - only need exit now, enter handled by pillars
const containerVariants = {
  initial: {},
  enter: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
  exit: {
    transition: { staggerChildren: 0.07, staggerDirection: 1 }, // Stagger exit downwards
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
  onEnterComplete: () => void; // Renamed for clarity
}

export default function FallingPillars({ onEnterComplete }: FallingPillarsProps) {
  // Removed endTransition logic and state

  // Only call onEnterComplete when the *last* pillar finishes entering.
  const handlePillarAnimationComplete = (definition: string, pillarIndex: number) => {
     if (definition === 'enter' && pillarIndex === pillarCount - 1) {
         console.log("[FallingPillars] Last pillar enter complete. Calling onEnterComplete (navigation).");
         onEnterComplete(); 
     }
     // No longer handles exit cleanup
  };

  return (
    <motion.div
      key="pillars-container"
      variants={containerVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      // onAnimationComplete is less reliable here due to staggerChildren on exit
      className="pointer-events-none fixed inset-0 z-[9999] flex overflow-hidden"
    >
      {[...Array(pillarCount)].map((_, i) => (
        <motion.div
          key={`pillar-${i}`}
          variants={pillarVariants}
          onAnimationComplete={(definition) => handlePillarAnimationComplete(definition, i)}
          className="relative h-full bg-black rounded-lg"
          style={{ width: `${100 / pillarCount}vw` }}
        />
      ))}
    </motion.div>
  );
} 