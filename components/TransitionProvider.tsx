"use client"; // Add this directive

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Keep for potential future use, though not directly interacting now
import barba from '@barba/core';
import gsap from 'gsap';

// Define the namespaces for pages that should have the special transition
const TRANSITION_NAMESPACES = ['features', 'use-cases'];

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Ensure this code runs only in the browser
    if (typeof window !== 'undefined') {
      // Prevent double initialization
      if (document.body.hasAttribute('data-barba-initialized')) return;
      document.body.setAttribute('data-barba-initialized', 'true');

      const tl = gsap.timeline(); // Reusable timeline

      barba.init({
        debug: process.env.NODE_ENV === 'development', // Enable debug in dev
        // Prevent links unless they have data-barba-prevent="false"
        prevent: ({ el }) => el.hasAttribute('data-barba-prevent') && el.getAttribute('data-barba-prevent') !== 'false',
        transitions: [{
          name: 'overlay-transition',
          // Only run between 'features' and 'use-cases'
          from: { namespace: TRANSITION_NAMESPACES },
          to: { namespace: TRANSITION_NAMESPACES },

          // --- Leave Animation ---
          async leave(data) {
            const done = this.async(); // Tell Barba to wait for animation
            tl.clear(); // Clear previous timeline animations

            // Panel UP
            tl.to('#transition-panel', {
              duration: 0.8,
              yPercent: 0, // Slide panel fully into view
              ease: 'power4.inOut',
            });

            // Fade out content *after* panel starts moving or is mostly up
            tl.to(data.current.container, {
              opacity: 0,
              duration: 0.4,
              ease: 'power1.in',
            }, "-=0.5"); // Start fade slightly before panel animation ends

            await tl.then(); // Wait for timeline to complete
            done(); // Signal Barba leave is done
          },

          // --- Enter Animation ---
          async enter(data) {
            const done = this.async();
            tl.clear();

            // Ensure scroll to top
            window.scrollTo(0, 0);

            // Initial state of new content (before panel moves)
            gsap.set(data.next.container, {
              opacity: 0,
              y: '50px', // Start slightly down
            });

            // Panel DOWN
            tl.to('#transition-panel', {
              duration: 0.8,
              yPercent: -100, // Slide panel UP and away
              ease: 'power4.inOut',
            });

            // Fade/Slide in content as panel moves away
            tl.to(data.next.container, {
              opacity: 1,
              y: '0px',
              duration: 0.6,
              ease: 'power1.out',
            }, "-=0.6"); // Start slightly before panel animation ends

            await tl.then();

            // Reset panel state for next transition AFTER animation
            gsap.set('#transition-panel', { yPercent: 100 }); // Reset off-screen (bottom)

            done();
          },
        }],
      });

      // Cleanup
      return () => {
        if (barba.destroy) {
          barba.destroy();
          document.body.removeAttribute('data-barba-initialized');
        }
      };
    }
  }, [router]); // Dependency array

  return (
    <div data-barba="wrapper" className="relative"> {/* Ensure wrapper has relative positioning context if needed */}
      {/* The Transition Panel */}
      <div
        id="transition-panel"
        className="fixed inset-0 z-50 bg-black transform translate-y-full" // Start off-screen (bottom)
        // Consider adding bg-opacity if needed e.g., bg-black/90
      ></div>
      {/* Page Content */}
      {children}
    </div>
  );
} 