"use client";

import { motion } from "framer-motion";
import { useTransitionContext } from "@/contexts/TransitionContext";

// Define the number of pillars
const pillarCount = 10; // Adjust as needed

// Variants for the container to stagger children
const containerVariants = {
  enter: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
  exit: {
    y: "-100%", // Animate the whole container up
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      when: "afterChildren" // Wait for pillars to finish before container moves (if needed)
    },
  },
};

// Variants for individual pillars
const pillarVariants = {
  initial: { y: "-100%" },
  enter: {
    y: "0%",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  // Exit animation is handled by the container's exit variant in this version
};

interface FallingPillarsProps {
  onComplete: () => void;
}

export default function FallingPillars({ onComplete }: FallingPillarsProps) {
  const { endTransition } = useTransitionContext();

  return (
    <motion.div
      key="pillars-container"
      variants={containerVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      onAnimationComplete={(definition) => {
        // Trigger navigation when enter animation completes
        if (definition === 'enter') {
            console.log("[FallingPillars] Enter animation complete.");
            onComplete(); 
        }
        // End the transition process when exit animation completes
        if (definition === 'exit') {
            console.log("[FallingPillars] Exit animation complete.");
            endTransition();
        }
      }}
      className="pointer-events-none fixed inset-0 z-[9999] flex overflow-hidden"
    >
      {[...Array(pillarCount)].map((_, i) => (
        <motion.div
          key={`pillar-${i}`}
          variants={pillarVariants}
          className="relative h-full bg-gray-900"
          style={{ width: `${100 / pillarCount}vw` }}
        />
      ))}
    </motion.div>
  );
} 