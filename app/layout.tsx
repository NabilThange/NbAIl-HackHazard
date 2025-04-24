import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ScrollToTop from "@/components/scroll-to-top"
import { SpeedInsights } from "@vercel/speed-insights/next"
import DynamicTransitionProvider from "@/components/DynamicTransitionProvider"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "NbAIl – Your Multimodal AI Assistant",
  description: "NbAIl is your intelligent partner that understands voice, screen, documents, and more.",
  icons: {
    icon: "/favicon.ico",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#9333ea", // Purple theme color
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.className} overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <DynamicTransitionProvider>
            <div data-barba="wrapper" className="relative">
              <div
                id="transition-panel"
                className="fixed inset-0 z-[100] bg-gray-900 pointer-events-none translate-y-full"
              ></div>
              <ScrollToTop />
              {children}
              <SpeedInsights />
            </div>
          </DynamicTransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}