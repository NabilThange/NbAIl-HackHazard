"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Blurred overlay for mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-2 right-2 backdrop-blur-md bg-black/30 rounded-md shadow-lg z-40 md:hidden mt-16"
            >
              <div className="px-4 py-4 space-y-2 text-center">
                <MobileNavLink href="/features">Features</MobileNavLink>
                <MobileNavLink href="/pricing">Pricing</MobileNavLink>
                <MobileNavLink href="/research">Research</MobileNavLink>
                <MobileNavLink href="/use-cases">Use Cases</MobileNavLink>
                <div className="pt-4 flex flex-col space-y-2">
                  <Button variant="outline" className="w-full justify-center" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button className="w-full justify-center bg-purple-600 hover:bg-purple-700" asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        className={`fixed top-0 mt-2 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-gray-900/90 md:backdrop-blur-md shadow-md" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-500" />
              <span className="text-white font-bold text-xl">NbAIl</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink href="/features">Features</NavLink>
              <NavLink href="/pricing">Pricing</NavLink>
              <NavLink href="/research">Research</NavLink>
              <NavLink href="/use-cases">Use Cases</NavLink>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center z-50">
              <label className="hamburger cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={() => setIsOpen(!isOpen)}
                  className="hidden"
                />
                <svg viewBox="0 0 32 32" className="h-8 w-8">
                  <path
                    className="line line-top-bottom"
                    d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  ></path>
                  <path
                    className="line"
                    d="M7 16 27 16"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  ></path>
                </svg>
              </label>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`text-sm font-medium relative group overflow-hidden ${isActive ? "text-white" : "text-gray-300"}`}
    >
      <span className="relative z-10 transition-colors duration-300 group-hover:text-white">{children}</span>
      {isActive ? (
        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-purple-500 rounded-full" />
      ) : (
        <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-purple-500 rounded-full transition-all duration-300 group-hover:w-full group-hover:left-0" />
      )}
    </Link>
  )
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`block py-2 px-3 rounded-md text-lg font-medium ${
        isActive ? "text-white font-semibold" : "text-gray-300"
      } hover:text-purple-500 hover:underline`}
    >
      {children}
    </Link>
  )
}
