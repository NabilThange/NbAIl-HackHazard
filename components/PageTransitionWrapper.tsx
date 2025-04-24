"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Define page lists for different transitions
const transition1Pages = ['/', '/features', '/use-cases'];
const transition2Pages = ['/pricing', '/research'];

// Define animation variants for Transition Type 1
const type1Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Define animation variants for Transition Type 2
const type2Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine which transition type to use (or none)
  let transitionType = null;
  let variants = {};
  let duration = 0.3; // Default duration

  if (transition1Pages.includes(pathname)) {
    transitionType = 'type1';
    variants = type1Variants;
    duration = 0.6;
  } else if (transition2Pages.includes(pathname)) {
    transitionType = 'type2';
    variants = type2Variants;
    duration = 0.3;
  }

  // Scroll to top on pathname change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // If the current path shouldn't have a transition, render children directly
  if (!transitionType) {
    return <>{children}</>;
  }

  // Otherwise, wrap children with AnimatePresence and motion.div
  return (
    <AnimatePresence
      mode="wait" // Ensures exit animation completes before enter starts
      initial={false} // No animation on initial load
    >
      <motion.div
        key={pathname} // Unique key triggers animation on route change
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants} // Apply the determined variants
        transition={{ duration: duration, ease: 'easeInOut' }} // Apply determined duration
        className="flex-grow" // Added back from previous version, seems useful
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 