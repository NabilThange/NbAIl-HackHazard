"use client";

import Link from "next/link"
import { Brain, Github, Twitter, Linkedin, Mail } from "lucide-react"
import { useTransitionContext } from "@/contexts/TransitionContext";

export default function Footer() {
  const { startTransition, isTransitioning } = useTransitionContext();

  const handleTransitionClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string, type: 'pillars' | 'circle' | 'fade-slide') => {
    if (isTransitioning) {
      console.log("[Footer] Transition already in progress, ignoring click.");
      event.preventDefault();
      return;
    }
    console.log(`[Footer] handleTransitionClick called for href: ${href}, type: ${type}`);
    event.preventDefault();
    let origin = undefined;
    if (type === 'circle') {
      origin = { x: event.clientX, y: event.clientY };
    }
    startTransition(type, href, origin);
  };

  const pillarsPages = ['/', '/features'];
  const circlePages = ['/pricing'];
  const fadeSlidePages = ['/use-cases', '/research'];

  const getTransitionType = (href: string): 'pillars' | 'circle' | null => {
      if (pillarsPages.includes(href)) return 'pillars';
      if (circlePages.includes(href)) return 'circle';
      return null;
  }

  return (
    <footer className="bg-black/[0.96] border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Link 
              href="/"
              onClick={(e) => handleTransitionClick(e, "/", 'pillars')}
              className="flex items-center space-x-2 mb-4"
              aria-disabled={isTransitioning}
            >
              <Brain className="h-8 w-8 text-purple-500" />
              <span className="text-white font-bold text-xl">NbAIl</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Your intelligent partner that understands voice, screen, documents, and more.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="mailto:example@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/features"
                  onClick={(e) => handleTransitionClick(e, "/features", 'pillars')}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-disabled={isTransitioning}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  onClick={(e) => handleTransitionClick(e, "/pricing", 'circle')}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-disabled={isTransitioning}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="/research" 
                  onClick={(e) => handleTransitionClick(e, "/research", 'fade-slide')}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-disabled={isTransitioning}
                >
                  Research
                </Link>
              </li>
              <li>
                <Link 
                  href="/use-cases" 
                  onClick={(e) => handleTransitionClick(e, "/use-cases", 'fade-slide')}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-disabled={isTransitioning}
                >
                  Use Cases
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-gray-400 hover:text-white transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} NbAIl. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li>
                <Link href="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
