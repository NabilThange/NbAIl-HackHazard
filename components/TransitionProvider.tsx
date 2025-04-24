"use client"; // Add this directive

import { useEffect } from 'react';
import barba from '@barba/core';
import gsap from 'gsap';

// Namespaces for the morphing transition
const MORPHING_NAMESPACES = ['home', 'features', 'use-cases', 'pricing', 'research'];

// --- Morphing Card Transition Logic ---

const morphLeave = async (container: HTMLElement): Promise<void> => {
  console.log("[Barba Transition - Morphing Card] LEAVING:", container?.dataset?.barbaNamespace);
  const card = document.getElementById("transition-card");
  const panel = document.getElementById("transition-panel");

  if (!card || !panel || !container) {
    console.error("[Barba Morph Leave] Missing elements (card, panel, or container)");
    return; // Exit if essential elements are missing
  }

  document.body.classList.add('is-transitioning'); // Add body class

  const tl = gsap.timeline();

  tl
    // 1. Animate card appearing and scaling slightly
    .fromTo(card, 
      { opacity: 0, scale: 0.7, yPercent: -50, xPercent: -50 }, // Start state (centered)
      { opacity: 1, scale: 1.1, duration: 0.4, ease: 'power1.out' } // End state
    )
    // 2. Simultaneously fade and shrink current container towards the card's position
    .to(container, {
      opacity: 0,
      scale: 0.8, // Shrink down
      // transformOrigin: 'center center', // Ensure shrink towards center
      duration: 0.5, // Slightly longer than card appearance
      ease: 'power2.in'
    }, "<+=0.1") // Start slightly after card animation begins
    // 3. Simultaneously slide panel up from bottom
    .to(panel, {
      yPercent: 0,
      duration: 0.6,
      ease: 'power3.inOut'
    }, "<"); // Start at the same time as container shrink

  await tl;
};

const morphEnter = async (container: HTMLElement): Promise<void> => {
  console.log("[Barba Transition - Morphing Card] ENTERING:", container?.dataset?.barbaNamespace);
  window.scrollTo(0, 0);
  const card = document.getElementById("transition-card");
  const panel = document.getElementById("transition-panel");

  if (!card || !panel || !container) {
    console.error("[Barba Morph Enter] Missing elements (card, panel, or container)");
    document.body.classList.remove('is-transitioning'); // Ensure class is removed if error
    // Set container visible immediately as a fallback
    gsap.set(container, { opacity: 1, scale: 1, y: 0 });
    return; 
  }

  const tl = gsap.timeline({
    onComplete: () => {
      // Reset elements AFTER the timeline completes
      gsap.set(panel, { yPercent: 100 });
      gsap.set(card, { opacity: 0, scale: 1 }); // Reset card state
      document.body.classList.remove('is-transitioning'); // Remove body class
      console.log("[Barba Transition - Morphing Card] Transition Complete & Reset");
    }
  });

  tl
    // 1. Slide panel up and offscreen
    .to(panel, {
      yPercent: -100,
      duration: 0.6,
      ease: 'power3.inOut'
    })
    // 2. Simultaneously scale card up and fade it out
    .to(card, {
      scale: 1.5,
      opacity: 0,
      duration: 0.4,
      ease: 'power1.in'
    }, "<") // Start at same time as panel move
    // 3. Simultaneously fade in new container, scaling up and sliding slightly
    .from(container, { // Use .from() to animate from a starting state
      opacity: 0,
      scale: 0.9,
      y: 30,
      duration: 0.5,
      ease: 'power2.out'
    }, "<+=0.15"); // Start shortly after card/panel animations begin

  await tl;
};


export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.body.hasAttribute('data-barba-initialized')) return;
    document.body.setAttribute('data-barba-initialized', 'true');
    if (history.scrollRestoration) history.scrollRestoration = 'manual';
    console.log('[Barba Debug] useEffect: Initializing Barba...');

    barba.init({
      // debug: true,
      prevent: ({ el, href }: { el: HTMLElement | undefined; href: string }) => {
        // Prevent links explicitly marked with data-barba-prevent="true"
        if (el?.hasAttribute('data-barba-prevent') && el.getAttribute('data-barba-prevent') !== 'false') {
           console.log(`[Barba Prevent] Preventing via attribute on element:`, el);
           return true;
        }
        // Prevent specific routes like login/signup/chat
        const blockedPaths = ['/login', '/signup', '/chat'];
        try {
          if (!href) return true; // Prevent empty links
          const targetPath = new URL(href, window.location.origin).pathname;
          // Prevent if the path IS one of the blocked ones
          const isBlocked = blockedPaths.some(path => targetPath.startsWith(path)); 
          if (isBlocked) {
              console.log(`[Barba Prevent] PREVENTING transition to blocked route: ${targetPath}`);
              return true;
          }
          // If not blocked, allow Barba (return false implicitly by not returning true)
          console.log(`[Barba Prevent] ALLOWING transition to route: ${targetPath}`);
          return false; 
        } catch (e) {
          console.error(`[Barba Prevent] Error parsing href '${href}'. Preventing transition.`, e);
          return true; // Prevent on error
        }
      },
      transitions: [
        {
          // --- Single Morphing Card Transition --- 
          name: 'morphing-card',
          sync: false, // Standard leave-then-enter
          // Apply to all specified namespaces
          from: { namespace: MORPHING_NAMESPACES },
          to: { namespace: MORPHING_NAMESPACES },
          leave: async (data: any) => await morphLeave(data.current.container),
          enter: async (data: any) => await morphEnter(data.next.container),
        },
        // No other transitions needed - this covers all desired routes
        // Barba won't run transitions for routes blocked by 'prevent'
      ],
    });

    console.log('[Barba Debug] useEffect: Barba initialization complete.');

    return () => {
      if (barba.destroy) {
        console.log('[Barba Debug] useEffect CLEANUP: Destroying Barba instance.');
        barba.destroy();
        document.body.removeAttribute('data-barba-initialized');
        document.body.classList.remove('is-transitioning'); // Ensure cleanup on unmount
      }
    };
  }, []);

  return <>{children}</>;
} 