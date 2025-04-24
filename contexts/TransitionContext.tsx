"use client";

import React, { createContext, useState, useContext, useCallback } from 'react';

interface TransitionContextProps {
  isTransitioning: boolean;
  transitionType: 'pillars' | 'circle' | null;
  transitionOrigin: { x: number; y: number } | null;
  targetHref: string | null;
  startTransition: (type: 'pillars' | 'circle', href: string, origin?: { x: number; y: number }) => void;
  endTransition: () => void;
}

const TransitionContext = createContext<TransitionContextProps | undefined>(undefined);

export const TransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<'pillars' | 'circle' | null>(null);
  const [transitionOrigin, setTransitionOrigin] = useState<{ x: number; y: number } | null>(null);
  const [targetHref, setTargetHref] = useState<string | null>(null);

  const startTransition = useCallback((type: 'pillars' | 'circle', href: string, origin?: { x: number; y: number }) => {
    console.log(`[TransitionContext] Starting ${type} transition to ${href}`);
    setTransitionType(type);
    setTargetHref(href);
    setTransitionOrigin(origin || null);
    setIsTransitioning(true);
  }, []);

  const endTransition = useCallback(() => {
    console.log("[TransitionContext] Ending transition");
    setIsTransitioning(false);
    setTimeout(() => {
        setTransitionType(null);
        setTargetHref(null);
        setTransitionOrigin(null);
    }, 50);
  }, []);

  return (
    <TransitionContext.Provider value={{ isTransitioning, transitionType, transitionOrigin, targetHref, startTransition, endTransition }}>
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