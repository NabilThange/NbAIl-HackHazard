"use client"; // Mark this as a Client Component

import dynamic from 'next/dynamic';
import type React from 'react';

// Dynamically import the actual TransitionProvider with SSR disabled *inside* this client component
const ActualTransitionProvider = dynamic(() => import('@/components/TransitionProvider'), {
  ssr: false,
});

// This component just renders the dynamically imported provider, passing children through
export default function DynamicTransitionProvider({ children }: { children: React.ReactNode }) {
  return <ActualTransitionProvider>{children}</ActualTransitionProvider>;
} 