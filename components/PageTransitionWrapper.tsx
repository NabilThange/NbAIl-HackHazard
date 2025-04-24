"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import FallingPillars from "./FallingPillars";
import ExpandingCircle from "./ExpandingCircle";

// Define page lists for different transitions
const transition1Pages = ['/', '/features', '/use-cases'];
const transition2Pages = ['/pricing', '/research'];

// Define animation variants for the page content itself (simple fade)
const contentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, delay: 0.5 } }, // Fade in after overlay starts animating
  exit: { opacity: 0, transition: { duration: 0.2 } }, // Fade out quickly
};

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [transitionComponentKey, setTransitionComponentKey] = useState<string | null>(null);

  // Determine which transition type to use based on the *previous* path or current path
  useEffect(() => {
    if (transition1Pages.includes(pathname)) {
      setTransitionComponentKey('pillars');
    } else if (transition2Pages.includes(pathname)) {
      setTransitionComponentKey('circle');
    } else {
      setTransitionComponentKey(null); // No transition for other pages
    }

    // Scroll to top on pathname change
    window.scrollTo(0, 0);

  }, [pathname]);

  // Helper to render the correct overlay component
  const renderTransitionOverlay = () => {
    switch (transitionComponentKey) {
      case 'pillars':
        return <FallingPillars />;
      case 'circle':
        return <ExpandingCircle />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence 
      mode="wait" // Wait for exit animations (both content and overlay) to finish
      initial={false}
    >
      {/* Render overlay based on state. It will animate based on its own variants */} 
      {renderTransitionOverlay()}

      {/* Animate the page content (children) */} 
      <motion.div
        key={pathname} // Key triggers the exit/enter of the content
        initial="initial"
        animate="animate"
        exit="exit"
        variants={contentVariants} // Use simple fade for content
        className="flex-grow" // Ensures content takes space
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 