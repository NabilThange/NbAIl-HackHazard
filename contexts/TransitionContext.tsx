"use client";

import React, { createContext, useState, useContext, useCallback, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define possible transition types
type TransitionType = 'pillars' | 'circle' | 'page-push' | null;

interface TransitionContextProps {
  transitionType: TransitionType;
  transitionOrigin: { x: number; y: number } | null;
  // isPending: boolean; // From useTransition
  startPageTransition: (type: TransitionType, href: string, origin?: { x: number; y: number }) => void;
}

const TransitionContext = createContext<TransitionContextProps | undefined>(undefined);

export const TransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  // State to hold the *type* of the upcoming transition
  const [transitionType, setTransitionType] = useState<TransitionType>(null);
  const [transitionOrigin, setTransitionOrigin] = useState<{ x: number; y: number } | null>(null);
  // isPending indicates if the router.push() transition is active
  const [isPending, startReactTransition] = useTransition();

  const startPageTransition = useCallback((type: TransitionType, href: string, origin?: { x: number; y: number }) => {
    console.log(`[TransitionContext] Setting transition type: ${type} for href: ${href}`);
    setTransitionType(type); 
    setTransitionOrigin(origin || null);
    
    // Use React's startTransition to wrap the navigation
    startReactTransition(() => {
        console.log(`[TransitionContext] Calling router.push('${href}') inside startTransition`);
        router.push(href);
        // Reset type *after* navigation starts, ready for next transition detection
        // PageTransitionController will use the type *before* this reset
        // setTransitionType(null); 
        // setTransitionOrigin(null);
    });

  }, [router, startReactTransition]); // Include startReactTransition dependency

  // We reset the transition type state *after* the navigation has likely occurred
  // and the new component is mounting/animating in the PageTransitionController.
  useEffect(() => {
    if (!isPending && transitionType !== null) {
      console.log("[TransitionContext] Resetting transition type after pending state ended.");
      setTransitionType(null);
      setTransitionOrigin(null);
    }
  }, [isPending, transitionType]);


  return (
    <TransitionContext.Provider value={{ transitionType, transitionOrigin, startPageTransition }}>
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransitionContext = () => {
  const context = useContext(TransitionContext);
  if (context === undefined) {
    throw new Error('useTransitionContext must be used within a TransitionProvider');
  }
  return context;
}; 