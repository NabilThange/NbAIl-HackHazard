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
        staggerChildren: 0.04, // FASTER stagger
        delayChildren: 0.05   // Minimal initial delay
    },
  },
  exit: {
    transition: { 
        staggerChildren: 0.04, // FASTER stagger (match enter)
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
        duration: 0.2, // FASTER duration
        ease: [0.22, 1, 0.36, 1] 
    }
  },
  exit: { 
    y: "100%", 
    transition: { 
        duration: 0.2, // FASTER duration (match enter)
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