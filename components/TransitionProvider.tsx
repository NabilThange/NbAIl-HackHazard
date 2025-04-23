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
    if (typeof window !== 'undefined') {
      console.log('TransitionProvider: useEffect running (client-side check passed)'); // Log 1: Confirm client-side execution

      if (document.body.hasAttribute('data-barba-initialized')) {
         console.log('TransitionProvider: Barba already initialized, skipping.');
         return;
      }
      document.body.setAttribute('data-barba-initialized', 'true');
      console.log('TransitionProvider: Initializing Barba...'); // Log 2: Confirm init attempt

      const tl = gsap.timeline(); // Reusable timeline

      barba.init({
        // Keep debug false in production unless needed, use manual logs
        // debug: process.env.NODE_ENV === 'development',
        prevent: ({ el }) => {
          // Log 3: Link checking
          const href = el.getAttribute('href');
          const preventAttr = el.getAttribute('data-barba-prevent');
          console.log(`Barba checking link: href=${href}, data-barba-prevent=${preventAttr}`);

          // Explicitly allow links with data-barba-prevent="false"
          const allowTransition = el.hasAttribute('data-barba-prevent') && preventAttr === 'false';
          console.log(`Barba decision: Allow transition=${allowTransition}`);

          // Prevent everything *except* those explicitly allowed
          return !allowTransition;
        },
        transitions: [{
          name: 'overlay-transition',
          // Only run between 'features' and 'use-cases'
          from: { namespace: TRANSITION_NAMESPACES },
          to: { namespace: TRANSITION_NAMESPACES },

          // --- Leave Animation ---
          async leave(data) {
             // Log 4: Leave hook triggered
            console.log(`Overlay transition: LEAVE triggered from ${data.current.namespace} to ${data.next.namespace}`);
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
             // Log 5: Enter hook triggered
            console.log(`Overlay transition: ENTER triggered into ${data.next.namespace} from ${data.current.namespace}`);
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

      console.log('TransitionProvider: Barba initialization complete.'); // Log 6: Confirm init finished

      // Cleanup
      return () => {
        if (barba.destroy) {
          console.log('TransitionProvider: Cleaning up Barba instance.'); // Log 7: Cleanup
          barba.destroy();
          document.body.removeAttribute('data-barba-initialized');
        }
      };
    } else {
       console.log('TransitionProvider: Skipping Barba init (not in browser).'); // Log if SSR check fails
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