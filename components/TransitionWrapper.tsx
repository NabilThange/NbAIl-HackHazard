"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

// Animation variants for the page transition
const pageVariants = {
  initial: {
    opacity: 0,
    y: "20%", // Start slightly below the viewport (adjust as needed)
  },
  in: {
    opacity: 1,
    y: 0, // Slide in to position
  },
  out: {
    opacity: 0,
    y: "-20%", // Slide out upwards (adjust as needed)
  },
};

// Transition settings
const pageTransition = {
  type: "tween", // Use tween for smoother easing compared to default spring for y
  ease: "anticipate", // Example easing, can be "easeInOut", etc.
  duration: 0.6, // Adjust duration
};

export default function TransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence
      mode="wait" // Wait for exit animation to complete before starting enter
      initial={false} // Don't run initial animation on first load
    >
      <motion.div
        key={pathname} // Key prop tells AnimatePresence when the component changes
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="flex-grow" // Ensures the div takes up space
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 