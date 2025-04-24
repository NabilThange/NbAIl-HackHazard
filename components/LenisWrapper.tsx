'use client'

import { ReactNode } from 'react'

// This component no longer needs to manage Lenis initialization.
// It now just renders its children.
export default function LenisWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>
} 