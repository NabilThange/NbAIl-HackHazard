'use client';

import React, { useRef, ReactNode, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';

interface StickyWrapperProps {
  children: ReactNode;
  // Optional: Control the "stickiness" factor (0 = no stick, 1 = full stick to center)
  stickiness?: number; 
}

const StickyWrapper = ({ children, stickiness = 0.3 }: StickyWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { rawX, rawY, setIsSticky, setStickyOffset } = useCursor();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const element = ref.current;
    const rect = element.getBoundingClientRect();

    // Calculate element center
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;

    // Use raw mouse position from context for accurate distance calculation
    const mouseX = rawX.get(); 
    const mouseY = rawY.get();

    // Calculate distance and direction from mouse to element center
    const distanceX = mouseX - elementCenterX;
    const distanceY = mouseY - elementCenterY;

    // Calculate the offset to apply (pull towards center based on stickiness)
    // The further the mouse, the less pull (can adjust this logic)
    const offsetX = distanceX * stickiness; 
    const offsetY = distanceY * stickiness;

    setStickyOffset({ x: offsetX, y: offsetY });

  }, [rawX, rawY, stickiness, setStickyOffset]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsSticky(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsSticky(false);
    setStickyOffset({ x: 0, y: 0 }); // Reset offset
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // Optional: Add visual feedback on hover within the wrapper itself
      // animate={{ scale: isHovered ? 1.05 : 1 }} 
      // transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      {children}
    </motion.div>
  );
};

export default StickyWrapper; 