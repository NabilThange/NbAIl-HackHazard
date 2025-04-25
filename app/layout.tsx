'use client';

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ScrollToTop from "@/components/scroll-to-top"
import { SpeedInsights } from "@vercel/speed-insights/next"
import PageTransitionWrapper from "@/components/PageTransitionWrapper"
import { SmoothCursor } from "@/components/ui/smooth-cursor"
import { LenisProvider } from "@/context/LenisProvider"
import { CursorProvider } from "@/context/CursorContext"
import Cursor from "@/components/cursor/Cursor"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.className}`}>
        <CursorProvider>
          <Cursor />
          <SmoothCursor />
          <script type="module" src="https://unpkg.com/@splinetool/viewer@1.9.85/build/spline-viewer.js" async></script>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <LenisProvider>
              <ScrollToTop />
              <PageTransitionWrapper>
                {children}
              </PageTransitionWrapper>
            </LenisProvider>
            <SpeedInsights />
          </ThemeProvider>
        </CursorProvider>
      </body>
    </html>
  )
}