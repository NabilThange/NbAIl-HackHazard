"use client";

import { motion } from "framer-motion";

// Variants for the expanding circle
const circleVariants = {
  initial: {
    scale: 0,
    opacity: 1, // Start opaque
  },
  animate: {
    scale: 150, // Scale large enough to cover screen (adjust as needed)
    opacity: 1,
    transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] }, // Faster, sharp ease
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.4, ease: "easeIn", delay: 0.2 }, // Fade out after slight delay
  },
};

export default function ExpandingCircle() {
  return (
    <motion.div
      key="expanding-circle"
      variants={circleVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="pointer-events-none fixed top-1/2 left-1/2 z-[9998] aspect-square w-4 rounded-full bg-purple-600"
      // Start as small circle in center. Use theme color.
      style={{ transform: "translate(-50%, -50%)" }} // Ensure centered origin
    />
  );
} 