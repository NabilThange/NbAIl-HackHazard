"use client";

import { motion } from "framer-motion";
import React from "react";

// UPDATED: Pillar count
const pillarCount = 5; 

// Container staggers children
const containerVariants = {
  initial: {},
  enter: {
    transition: { 
        staggerChildren: 0.08, // Adjust stagger to match target duration
        delayChildren: 0.1   // Keep a small initial delay
    },
  },
  exit: {
    transition: { 
        staggerChildren: 0.08, // Match enter stagger for symmetry
        staggerDirection: 1 
    }, 
  },
};

// Pillar variant: fall in (enter), fall out (exit)
const pillarVariants = {
  initial: { y: "-100%" },
  enter: { 
    y: "0%", 
    transition: { 
        // Total enter time = delayChildren + (pillarCount * staggerChildren) + duration 
        // Target ~0.6s => 0.1 + (5 * 0.08) + duration = 0.6 => 0.1 + 0.4 + duration = 0.6 => duration = 0.1 ? (too fast)
        // Let's aim for duration 0.25 => 0.1 + 0.4 + 0.25 = 0.75s (adjust stagger if needed)
        duration: 0.25, 
        ease: [0.22, 1, 0.36, 1] 
    }
  },
  exit: { 
    y: "100%", 
    transition: { 
        duration: 0.25, // Match enter duration
        ease: [0.64, 0, 0.78, 0] 
    }
  },
};

interface FallingPillarsProps {
  onEnterComplete: () => void; 
}

export default function FallingPillars({ onEnterComplete }: FallingPillarsProps) {

  const handlePillarAnimationComplete = (definition: string, pillarIndex: number) => {
     if (definition === 'enter' && pillarIndex === pillarCount - 1) {
         console.log("[FallingPillars] Last pillar enter complete. Calling onEnterComplete (navigation).");
         onEnterComplete(); 
     }
  };

  return (
    <motion.div
      key="pillars-container"
      variants={containerVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="pointer-events-none fixed inset-0 z-[9999] flex overflow-hidden"
    >
      {[...Array(pillarCount)].map((_, i) => (
        <motion.div
          key={`pillar-${i}`}
          variants={pillarVariants}
          onAnimationComplete={(definition) => handlePillarAnimationComplete(definition, i)}
          // UPDATED Styling
          className="relative h-full bg-black rounded-2xl" // Black, more rounded
          style={{ width: `${100 / pillarCount}vw` }} // Wider pillars (20vw)
        />
      ))}
    </motion.div>
  );
} 