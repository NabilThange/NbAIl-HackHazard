'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';

const Cursor = () => {
  const { rawX, rawY, isSticky, stickyOffset } = useCursor();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Spring physics for smooth movement
  const smoothOptions = { damping: 20, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(rawX, smoothOptions);
  const smoothY = useSpring(rawY, smoothOptions);

  // Effect to track mouse movement and visibility
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // Hide on screens narrower than 1024px
    };

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      rawX.set(clientX);
      rawY.set(clientY);
      setIsVisible(true); // Show cursor when mouse moves
    };

    const handleMouseLeave = () => {
      setIsVisible(false); // Hide cursor when mouse leaves window
    };
    
    // Initial check
    handleResize();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [rawX, rawY]);

  // Calculate transform values based on sticky state
  const transformX = useTransform(smoothX, (val) => val - 8 + (isSticky ? stickyOffset.x : 0)); // Offset by half size (8px)
  const transformY = useTransform(smoothY, (val) => val - 8 + (isSticky ? stickyOffset.y : 0)); // Offset by half size (8px)
  
  // Scale animation when sticky
  const scale = useTransform(isSticky ? motionValue(1) : motionValue(0), (value) => (value === 1 ? 1.5 : 1), {
    damping: 15, stiffness: 200, mass: 0.3
  });

  if (isMobile) {
    return null; // Don't render on mobile
  }

  return (
    <motion.div
      className="custom-cursor"
      style={{
        left: transformX,
        top: transformY,
        scale: scale,
        opacity: isVisible ? 1 : 0, // Fade in/out based on visibility
      }}
      transition={{ type: 'spring', ...smoothOptions }} // Apply spring to position
    />
  );
};

export default Cursor; 