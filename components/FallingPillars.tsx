"use client";

import { motion } from "framer-motion";

// Define the number of pillars
const pillarCount = 10; // Adjust as needed

// Variants for the container to stagger children
const containerVariants = {
  enter: {
    transition: {
      staggerChildren: 0.07, // Time between each pillar animation start
      delayChildren: 0.1, // Optional delay before the first pillar starts
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.07,
      staggerDirection: -1, // Animate in reverse on exit (optional, for rising effect)
    },
  },
};

// Variants for individual pillars
const pillarVariants = {
  initial: { y: "-100%" }, // Start above the screen
  enter: { 
    y: "0%", 
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } // Smoother ease
  },
  exit: { 
    y: "-100%",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
};

export default function FallingPillars() {
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
          className="relative h-full bg-gray-900" // Pillar color
          style={{ width: `${100 / pillarCount}vw` }} // Calculate width
        />
      ))}
    </motion.div>
  );
} 