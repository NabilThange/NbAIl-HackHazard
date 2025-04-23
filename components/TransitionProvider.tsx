"use client"; // Add this directive

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Keep for potential future use, though not directly interacting now
import barba from '@barba/core';
import gsap from 'gsap';

// Namespaces for the special overlay transition
const OVERLAY_TRANSITION_NAMESPACES = ['features', 'use-cases'];
// Namespaces for the default fade/slide transition
const DEFAULT_TRANSITION_NAMESPACES = ['home', 'pricing', 'research'];

// --- Default Fade/Slide Transition Logic ---
// Make async and use await
const defaultLeave = async (container: HTMLElement): Promise<void> => {
  console.log("Default transition: LEAVE");
  await gsap.to(container, { opacity: 0, duration: 0.4, ease: 'power1.in' });
};
// Make async and use await
const defaultEnter = async (container: HTMLElement): Promise<void> => {
  console.log("Default transition: ENTER");
  window.scrollTo(0, 0);
  gsap.set(container, { opacity: 0, y: 30 }); // Start slightly down
  await gsap.to(container, { opacity: 1, y: 0, duration: 0.5, ease: 'power1.out', delay: 0.1 });
};

// --- Overlay Transition Logic ---
// Make async and use await
const overlayLeave = async (container: HTMLElement): Promise<void> => {
  console.log("Overlay transition: LEAVE");
  const tl = gsap.timeline();
  tl.to('#transition-panel', { duration: 0.8, yPercent: 0, ease: 'power4.inOut' });
  tl.to(container, { opacity: 0, duration: 0.4, ease: 'power1.in' }, "-=0.5");
  await tl; // Await the timeline itself
};
// Make async and use await
const overlayEnter = async (container: HTMLElement): Promise<void> => {
  console.log("Overlay transition: ENTER");
  window.scrollTo(0, 0);
  const tl = gsap.timeline();
  gsap.set(container, { opacity: 0, y: 50 }); // Start further down
  tl.to('#transition-panel', { duration: 0.8, yPercent: -100, ease: 'power4.inOut' });
  tl.to(container, { opacity: 1, y: 0, duration: 0.6, ease: 'power1.out' }, "-=0.6");
  tl.set('#transition-panel', { yPercent: 100 }); // Reset panel AFTER animation
  await tl; // Await the timeline itself
};

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[Barba Debug] useEffect: Running (Client Side)');

      // Set scroll restoration to manual
      if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
        console.log('[Barba Debug] useEffect: Set history.scrollRestoration to manual');
      }

      if (document.body.hasAttribute('data-barba-initialized')) {
        console.log('[Barba Debug] useEffect: Already initialized, skipping.');
        return;
      }
      document.body.setAttribute('data-barba-initialized', 'true');
      console.log('[Barba Debug] useEffect: Initializing Barba...');

      barba.init({
        // debug: true, // Enable more verbose Barba logs if needed
        prevent: ({ el, href }: { el: any; href: string }) => {
          // 1. Prevent via element attribute
          if (el && el.hasAttribute('data-barba-prevent')) {
            console.log(`[Barba Prevent] Preventing via attribute on element:`, el);
            return true; // Prevent Barba
          }

          // 2. Allow specific routes (allow-list approach)
          const includedRoutes = [
            '/', // Home page
            '/features',
            '/pricing',
            '/research',
            '/use-cases'
          ];

          try {
            // Check if href is valid and parse its pathname
            if (!href) {
                console.log(`[Barba Prevent] Preventing due to empty href.`);
                return true; // Prevent if href is empty/null
            }
            // Use window.location.origin as base for relative URLs
            const url = new URL(href, window.location.origin);
            const pathname = url.pathname;

            // Check if the pathname exactly matches one of the included routes
            const shouldAllow = includedRoutes.some(path => pathname === path);

            if (shouldAllow) {
              console.log(`[Barba Prevent] ALLOWING transition to included route: ${pathname}`);
              return false; // Allow Barba to handle this link
            } else {
              console.log(`[Barba Prevent] PREVENTING transition to non-included route: ${pathname}`);
              return true; // Prevent Barba for all other links
            }
          } catch (e) {
            // Handle cases where href might be invalid URL format
            console.error(`[Barba Prevent] Error parsing href '${href}'. Preventing transition.`, e);
            return true; // Prevent on error
          }
        },
        transitions: [
          // --- Default Fade/Slide Transition (Applied to all allowed pages) ---
          {
            name: 'default-transition', // Renamed for clarity
            sync: false, // Set sync false for standard leave-then-enter animation
            // Make leave async and use await
            async leave(data: any) {
              console.log("[Barba Transition - Default] LEAVING:", data.current.namespace);
              // Fade out and slide down slightly
              await gsap.to(data.current.container, {
                opacity: 0,
                y: 50, // Slide down
                duration: 0.4, // Faster leave
                ease: 'power1.in'
              }); // Removed .then(() => {})
            },
            // Make enter async and use await
            async enter(data: any) {
              console.log("[Barba Transition - Default] ENTERING:", data.next.namespace);
              window.scrollTo(0, 0); // Reset scroll position
              // Use gsap.from() to animate IN from a starting state
              await gsap.from(data.next.container, {
                opacity: 0,
                y: 50, // Start slid down
                duration: 0.5, // Slightly longer enter
                ease: 'power1.out'
              }); // Removed .then(() => {})
            }
          }
          // Removed the specific overlay-transition
        ],
      });

      console.log('[Barba Debug] useEffect: Barba initialization complete.');

      // Add global hook logs for more insight
      barba.hooks.beforeLeave((data: any) => {
          console.log('[Barba Hook] beforeLeave', data?.current?.namespace);
      });
      barba.hooks.afterLeave((data: any) => {
          console.log('[Barba Hook] afterLeave', data?.current?.namespace);
      });
       barba.hooks.beforeEnter((data: any) => {
          console.log('[Barba Hook] beforeEnter', data?.next?.namespace);
      });
       barba.hooks.afterEnter((data: any) => {
          console.log('[Barba Hook] afterEnter', data?.next?.namespace);
      });
       barba.hooks.before((data: any) => {
          console.log('[Barba Hook] before (overall)', data?.trigger);
      });
       barba.hooks.after((data: any) => {
          console.log('[Barba Hook] after (overall)', data?.next?.namespace);
      });

      return () => {
        if (barba.destroy) {
          console.log('[Barba Debug] useEffect CLEANUP: Destroying Barba instance.');
          barba.destroy();
          document.body.removeAttribute('data-barba-initialized');
        }
      };
    } else {
      console.log('[Barba Debug] useEffect: Skipping Barba init (not in browser).');
    }
  }, [router]);

  return (
    <div data-barba="wrapper" className="relative">
      <div
        id="transition-panel"
        className="fixed inset-0 z-[100] bg-gray-950 transform translate-y-full pointer-events-none" // High z-index, ensure pointer-events none when hidden
      ></div>
      {children}
    </div>
  );
} 