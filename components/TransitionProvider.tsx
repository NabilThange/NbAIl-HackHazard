"use client"; // Add this directive

import { useEffect } from 'react';
import barba from '@barba/core';
import gsap from 'gsap';

// Define namespaces for each transition type
const SLIDING_PANEL_NAMESPACES = ['home', 'features', 'use-cases'];
const FADE_SLIDE_NAMESPACES = ['pricing', 'research'];

// --- Transition Logic Functions ---

// Sliding Panel - Leave Animation
const slideLeave = async (container: HTMLElement): Promise<void> => {
  console.log("[Barba Transition - Sliding Panel] LEAVING:", container.dataset.barbaNamespace);
  const tl = gsap.timeline();
  // Animate panel sliding up to cover screen
  tl.to('#transition-panel', {
    duration: 0.6, // Slightly faster
    yPercent: 0,
    ease: 'power2.inOut'
  });
  // Fade out current container slightly before panel fully covers
  tl.to(container, {
    opacity: 0,
    duration: 0.3,
    ease: 'power1.in'
  }, "-=0.4"); // Overlap animation
  await tl;
};

// Sliding Panel - Enter Animation
const slideEnter = async (container: HTMLElement): Promise<void> => {
  console.log("[Barba Transition - Sliding Panel] ENTERING:", container.dataset.barbaNamespace);
  window.scrollTo(0, 0);
  const tl = gsap.timeline();
  // Start new container invisible
  gsap.set(container, { opacity: 0 });
  // Animate panel sliding up and off screen
  tl.to('#transition-panel', {
    duration: 0.6, // Slightly faster
    yPercent: -100,
    ease: 'power2.inOut'
  });
  // Fade in new container as panel reveals it
  tl.to(container, {
    opacity: 1,
    duration: 0.4,
    ease: 'power1.out'
  }, "-=0.4"); // Overlap animation
  // Reset panel position after transition completes
  tl.set('#transition-panel', { yPercent: 100 });
  await tl;
};

// Fade + Slide - Leave Animation
const fadeSlideLeave = async (container: HTMLElement): Promise<void> => {
  console.log("[Barba Transition - Fade+Slide] LEAVING:", container.dataset.barbaNamespace);
  await gsap.to(container, {
    opacity: 0,
    y: 50, // Slide down
    duration: 0.4,
    ease: 'power1.in'
  });
};

// Fade + Slide - Enter Animation
const fadeSlideEnter = async (container: HTMLElement): Promise<void> => {
  console.log("[Barba Transition - Fade+Slide] ENTERING:", container.dataset.barbaNamespace);
  window.scrollTo(0, 0);
  // Use gsap.from to animate IN from a starting state
  await gsap.from(container, {
    opacity: 0,
    y: 50, // Start slid down
    duration: 0.5,
    ease: 'power1.out'
  });
};


export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure this only runs on the client side
    if (typeof window === 'undefined') return;

    console.log('[Barba Debug] useEffect: Running (Client Side)');

    // Prevent re-initialization
    if (document.body.hasAttribute('data-barba-initialized')) {
      console.log('[Barba Debug] useEffect: Already initialized, skipping.');
      return;
    }
    document.body.setAttribute('data-barba-initialized', 'true');
    console.log('[Barba Debug] useEffect: Initializing Barba...');

    // Set scroll restoration to manual
    if (history.scrollRestoration) {
      history.scrollRestoration = 'manual';
      console.log('[Barba Debug] useEffect: Set history.scrollRestoration to manual');
    }

    barba.init({
      // debug: true, // Uncomment for verbose logging
      prevent: ({ el, href }: { el: HTMLElement | undefined; href: string }) => {
        // 1. Prevent links explicitly marked with data-barba-prevent="true" or just data-barba-prevent
        if (el?.hasAttribute('data-barba-prevent') && el.getAttribute('data-barba-prevent') !== 'false') {
           console.log(`[Barba Prevent] Preventing via attribute on element:`, el);
           return true;
        }

        // 2. Check if the link points to one of the allowed routes for transitions
        const allowedPaths = ['/', '/features', '/pricing', '/research', '/use-cases'];
        try {
          if (!href) return true; // Prevent empty links
          const url = new URL(href, window.location.origin);
          const targetPath = url.pathname;

          // Allow if the path exactly matches an allowed path
          if (allowedPaths.includes(targetPath)) {
            console.log(`[Barba Prevent] ALLOWING transition to included route: ${targetPath}`);
            return false; // Do not prevent Barba
          } else {
            console.log(`[Barba Prevent] PREVENTING transition to non-included route: ${targetPath}`);
            return true; // Prevent Barba
          }
        } catch (e) {
          console.error(`[Barba Prevent] Error parsing href '${href}'. Preventing transition.`, e);
          return true; // Prevent on error
        }
      },
      transitions: [
        {
          // --- Transition A: Sliding Panel ---
          name: 'sliding-panel',
          sync: false, // Standard leave-then-enter flow
          // Rule: Use this transition if BOTH the 'from' and 'to' pages are in the SLIDING_PANEL_NAMESPACES list
          from: { namespace: SLIDING_PANEL_NAMESPACES },
          to: { namespace: SLIDING_PANEL_NAMESPACES },
          leave: async (data: any) => await slideLeave(data.current.container),
          enter: async (data: any) => await slideEnter(data.next.container),
        },
        {
          // --- Transition B: Fade + Slide ---
          name: 'fade-slide',
          sync: false,
          // Rule: Use this transition if BOTH the 'from' and 'to' pages are in the FADE_SLIDE_NAMESPACES list
          from: { namespace: FADE_SLIDE_NAMESPACES },
          to: { namespace: FADE_SLIDE_NAMESPACES },
          leave: async (data: any) => await fadeSlideLeave(data.current.container),
          enter: async (data: any) => await fadeSlideEnter(data.next.container),
        },
        {
           // --- Default/Fallback Transition (Fade + Slide) ---
           // Rule: Use this if none of the specific rules above match (e.g., home -> pricing)
           name: 'default-fallback',
           sync: false,
           // No specific 'from' or 'to' rules, making it the fallback
           leave: async (data: any) => await fadeSlideLeave(data.current.container), // Use fade-slide logic
           enter: async (data: any) => await fadeSlideEnter(data.next.container),  // Use fade-slide logic
        }
      ],
    });

    console.log('[Barba Debug] useEffect: Barba initialization complete.');

    // Cleanup function
    return () => {
      if (barba.destroy) {
        console.log('[Barba Debug] useEffect CLEANUP: Destroying Barba instance.');
        barba.destroy();
        document.body.removeAttribute('data-barba-initialized');
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // This component now ONLY renders its children, as the wrapper/panel are in layout.tsx
  return <>{children}</>;
} 