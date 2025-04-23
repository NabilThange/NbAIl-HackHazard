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
const defaultLeave = (container: HTMLElement): Promise<void> => {
  console.log("Default transition: LEAVE");
  return gsap.to(container, { opacity: 0, duration: 0.4, ease: 'power1.in' }).then();
};
const defaultEnter = (container: HTMLElement): Promise<void> => {
  console.log("Default transition: ENTER");
  window.scrollTo(0, 0);
  gsap.set(container, { opacity: 0, y: 30 }); // Start slightly down
  return gsap.to(container, { opacity: 1, y: 0, duration: 0.5, ease: 'power1.out', delay: 0.1 }).then();
};

// --- Overlay Transition Logic ---
const overlayLeave = (container: HTMLElement): Promise<void> => {
  console.log("Overlay transition: LEAVE");
  const tl = gsap.timeline();
  tl.to('#transition-panel', { duration: 0.8, yPercent: 0, ease: 'power4.inOut' });
  tl.to(container, { opacity: 0, duration: 0.4, ease: 'power1.in' }, "-=0.5");
  return tl.then();
};
const overlayEnter = (container: HTMLElement): Promise<void> => {
  console.log("Overlay transition: ENTER");
  window.scrollTo(0, 0);
  const tl = gsap.timeline();
  gsap.set(container, { opacity: 0, y: 50 }); // Start further down
  tl.to('#transition-panel', { duration: 0.8, yPercent: -100, ease: 'power4.inOut' });
  tl.to(container, { opacity: 1, y: 0, duration: 0.6, ease: 'power1.out' }, "-=0.6");
  tl.set('#transition-panel', { yPercent: 100 }); // Reset panel AFTER animation
  return tl.then();
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
        prevent: () => false, // Allow all transitions for testing
        transitions: [
          // Specific Overlay Transition (Features <-> Use Cases)
          {
            name: 'overlay-transition',
            from: { namespace: OVERLAY_TRANSITION_NAMESPACES },
            to: { namespace: OVERLAY_TRANSITION_NAMESPACES },
            async leave({ current }) {
                console.log('[Barba Debug] overlay-transition: leave hook fired.', { from: current.namespace });
                await overlayLeave(current.container);
            },
            async enter({ next }) {
                console.log('[Barba Debug] overlay-transition: enter hook fired.', { to: next.namespace });
                await overlayEnter(next.container);
            }
          },
          // Default Fade/Slide Transition (Explicit rules)
          {
            name: 'default-transition',
            // Explicitly define transitions involving home, pricing, or research
            // This covers:
            // - home <-> pricing
            // - home <-> research
            // - pricing <-> research
            // - home -> features/use-cases (and vice-versa)
            // - pricing -> features/use-cases (and vice-versa)
            // - research -> features/use-cases (and vice-versa)
            // Note: It WON'T cover features <-> use-cases as that's handled above.
            from: { namespace: [...DEFAULT_TRANSITION_NAMESPACES, ...OVERLAY_TRANSITION_NAMESPACES] },
            to: { namespace: [...DEFAULT_TRANSITION_NAMESPACES, ...OVERLAY_TRANSITION_NAMESPACES] },
            // We add a condition here to ensure this transition doesn't run
            // when the overlay transition should (i.e., features <-> use-cases)
            custom: ({ current, next }) => {
                const isOverlayFrom = OVERLAY_TRANSITION_NAMESPACES.includes(current.namespace);
                const isOverlayTo = OVERLAY_TRANSITION_NAMESPACES.includes(next.namespace);
                // Only run default if it's NOT an overlay-to-overlay transition
                return !(isOverlayFrom && isOverlayTo);
            },
            async leave({ current }) {
                console.log('[Barba Debug] default-transition: leave hook fired.', { from: current.namespace });
                await defaultLeave(current.container);
            },
            async enter({ next }) {
                console.log('[Barba Debug] default-transition: enter hook fired.', { to: next.namespace });
                await defaultEnter(next.container);
            }
          }
        ],
      });

      console.log('[Barba Debug] useEffect: Barba initialization complete.');

      // Add global hook logs for more insight
      barba.hooks.beforeLeave((data) => {
          console.log('[Barba Hook] beforeLeave', data?.current?.namespace);
      });
      barba.hooks.afterLeave((data) => {
          console.log('[Barba Hook] afterLeave', data?.current?.namespace);
      });
       barba.hooks.beforeEnter((data) => {
          console.log('[Barba Hook] beforeEnter', data?.next?.namespace);
      });
       barba.hooks.afterEnter((data) => {
          console.log('[Barba Hook] afterEnter', data?.next?.namespace);
      });
       barba.hooks.before((data) => {
          console.log('[Barba Hook] before (overall)', data?.trigger);
      });
       barba.hooks.after((data) => {
          console.log('[Barba Hook] after (overall)', data?.next?.namespace);
      });

      return () => {
        if (barba.destroy) {
          console.log('[Barba Debug] useEffect: Cleaning up Barba instance.');
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