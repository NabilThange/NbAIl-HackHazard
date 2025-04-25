"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { usePathname } from "next/navigation"
import StickyWrapper from "@/components/sticky/StickyWrapper"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { scrollY } = useScroll()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const scrollThreshold = [0, 50]

  const backgroundColor = useTransform(
    scrollY,
    scrollThreshold,
    ["rgba(0, 0, 0, 0)", "rgba(17, 24, 39, 0.8)"]
  )

  const backdropFilter = useTransform(
    scrollY,
    scrollThreshold,
    ["blur(0px)", "blur(8px)"]
  )

  const boxShadow = useTransform(
    scrollY,
    scrollThreshold,
    ["none", "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"]
  )

  return (
    <>
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
                <MobileNavLink href="/features" data-barba-prevent="false">Features</MobileNavLink>
                <MobileNavLink href="/pricing" data-barba-prevent="false">Pricing</MobileNavLink>
                <MobileNavLink href="/research" data-barba-prevent="false">Research</MobileNavLink>
                <MobileNavLink href="/use-cases" data-barba-prevent="false">Use Cases</MobileNavLink>
                <MobileNavLink href="/bucket-list" data-barba-prevent="false">Bucket List</MobileNavLink>
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

      <motion.nav
        style={{ backgroundColor, backdropFilter, boxShadow }}
        className="fixed top-0 mt-2 left-0 right-0 z-50 transition-colors duration-100"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-500" />
              <span className="text-white font-bold text-xl">NbAIl</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/features">Features</NavLink>
              <NavLink href="/research">Research</NavLink>
              <NavLink href="/use-cases">Use Cases</NavLink>
              <NavLink href="/bucket-list">Bucket List</NavLink>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>

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
      </motion.nav>
    </>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <StickyWrapper>
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
    </StickyWrapper>
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
