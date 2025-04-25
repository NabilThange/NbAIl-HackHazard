'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { MotionValue, motionValue } from 'framer-motion';

interface CursorContextProps {
  // Raw mouse position (updated directly on mouse move)
  rawX: MotionValue<number>;
  rawY: MotionValue<number>;
  // Sticky state
  isSticky: boolean;
  setIsSticky: (value: boolean) => void;
  // Sticky offset (how much to pull the cursor)
  stickyOffset: { x: number; y: number };
  setStickyOffset: (offset: { x: number; y: number }) => void;
}

const CursorContext = createContext<CursorContextProps | undefined>(undefined);

export const CursorProvider = ({ children }: { children: ReactNode }) => {
  const rawX = motionValue(0);
  const rawY = motionValue(0);
  const [isSticky, setIsSticky] = useState(false);
  const [stickyOffset, setStickyOffset] = useState({ x: 0, y: 0 });

  const contextValue = {
    rawX,
    rawY,
    isSticky,
    setIsSticky,
    stickyOffset,
    setStickyOffset,
  };

  return (
    <CursorContext.Provider value={contextValue}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
}; 